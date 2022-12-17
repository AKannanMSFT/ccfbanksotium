#!/bin/bash

# -------------------------- Preparation --------------------------

echo "Building Banksotium"
npm run build > /dev/null 2>&1

echo "Launching sandbox - with one Central Bank and two PFIs hosting. 5 PFIs will use it "
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 6 > /dev/null 2>&1 &
sandbox_pid=$!

check_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    echo -n "$test_name: "
    if [ "$expected" == "$actual" ]; then
        echo "[Pass]"
    else
        echo "[Fail]: $expected expected, but got $actual -- Killing $sandbox_pid"
        echo "Waiting for logs to be ready..."
        sleep 5
        echo "$(cat /proc/$(pgrep -f ./cchost)/fd/1)"

        (kill -9 $sandbox_pid)
        exit 1
    fi
}

cert_arg() {
    caller="$1"
    echo "--cacert ./workspace/sandbox_common/service_cert.pem --cert ./workspace/sandbox_common/${caller}_cert.pem --key ./workspace/sandbox_common/${caller}_privk.pem"
}

echo "Sandbox PID: $sandbox_pid"

server="https://127.0.0.1:8000"
only_status_code="-s -o /dev/null -w %{http_code}"

echo "Waiting for Banksotium to start..."
#Copying this logic from Takuro's App in https://github.com/takuro-sato/ccf-app-template/blob/9c4e5e9b45330aaab35e20b3548731ee1b8a450d/banking-app/test.sh
a=1
retcode="000"
while [ "200" != $retcode ]
do
    retcode="$(curl $server/app/commit -X GET --cacert ./workspace/sandbox_common/service_cert.pem $only_status_code)"
    sleep 1
    echo "elapsed $a seconds. Server returned $retcode"    
    ((a+=1))
done

# -------------------------- Test Data Load --------------------------

centralBank_id=$(openssl x509 -in "./workspace/sandbox_common/user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank1_id=$(openssl x509 -in "./workspace/sandbox_common/user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank2_id=$(openssl x509 -in "./workspace/sandbox_common/user2_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank3_id=$(openssl x509 -in "./workspace/sandbox_common/user3_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank4_id=$(openssl x509 -in "./workspace/sandbox_common/user4_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank5_id=$(openssl x509 -in "./workspace/sandbox_common/user5_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
register_thyself_data="{\"user_id\": \"$centralBank_id\"}"

# -------------------------- Test Cases  --------------------------
check_eq "Test Heartbeat Service" "200" "$(curl $server/app/heartbeat -X GET $(cert_arg "member0") $only_status_code)"
check_eq "Central Bank Register Thyself" "200" "$(curl $server/app/register/thyself -X POST $(cert_arg "member0") -H "Content-Type: application/json" -d "$register_thyself_data" $only_status_code)"

# -------------------------- Wind Down --------------------------
echo "Killing the Sandbox $sandbox_pid"
kill -9 $sandbox_pid
echo "OK"
exit 0