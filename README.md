# ccfbanksotium
This repository contains a wholesale CBDC implementation that runs on CCF.

There are broadly two functionalities that the implementation offers:
 - Digital Depository Receipt origination and exchange
 - Identity discovery and maintenance

CCF is used to protect the identity of consumers belonging to participating financial institution (PFI). Also, the transactions details are made visibile only to the issuer and acquirer PFIs. This architecture is well suited for a regulated liablity network (RLN). Central Bank have the ability to view all DDR data (and no consumer identity data). PFIs can search based on consumer attributes to discover member PFI of target consumer. 
