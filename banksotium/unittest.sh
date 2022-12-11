#!/bin/bash

# -------------------------- Preparation --------------------------

echo "Building Banksotium"
npm run build > /dev/null 2>&1

echo "Launching sandbox - with one Central Bank and two PFIs hosting. 5 PFIs will use it "
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 6 > /dev/null 2>&1 &
sandbox_pid=$!

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

centralBank_id=$(openssl x509 -in "./workspace/sandbox_common/user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank1_id=$(openssl x509 -in "./workspace/sandbox_common/user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank2_id=$(openssl x509 -in "./workspace/sandbox_common/user2_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank3_id=$(openssl x509 -in "./workspace/sandbox_common/user3_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank4_id=$(openssl x509 -in "./workspace/sandbox_common/user4_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
bank5_id=$(openssl x509 -in "./workspace/sandbox_common/user5_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

echo "Register the Central Bank as $centralBank_id"

echo "OK"
kill -9 $sandbox_pid
exit 0