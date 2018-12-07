@ECHO off
set DEMO_APP_SIGNATURE_CERT_PRIVATE_KEY=./ssl/demoapp-client-privatekey-2018.pem
set MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT=./ssl/stg-auth-signing-public.pem

set MYINFO_APP_CLIENT_ID=STG2-MYINFO-SELF-TEST
set MYINFO_APP_CLIENT_SECRET=44d953c796cccebcec9bdc826852857ab412fbe2
set MYINFO_APP_REDIRECT_URL=http://localhost:3001/callback
set MYINFO_APP_REALM=http://localhost:3001

rem SANDBOX ENVIRONMENT (no PKI digital signature)
set AUTH_LEVEL=L0
set MYINFOBIZ_API_AUTHORISE=https://sandbox.api.myinfo.gov.sg/biz/v1/authorise
set MYINFOBIZ_API_TOKEN=https://sandbox.api.myinfo.gov.sg/biz/v1/token
set MYINFOBIZ_API_ENTITYPERSON=https://sandbox.api.myinfo.gov.sg/biz/v1/entity-person

rem TEST ENVIRONMENT (with PKI digital signature)
rem set AUTH_LEVEL=L2
rem set MYINFOBIZ_API_AUTHORISE=https://test.api.myinfo.gov.sg/biz/v1/authorise
rem set MYINFOBIZ_API_TOKEN=https://test.api.myinfo.gov.sg/biz/v1/token
rem set MYINFOBIZ_API_ENTITYPERSON=https://test.api.myinfo.gov.sg/biz/v1/entity-person

npm start
