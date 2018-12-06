@ECHO off
set MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY=./ssl/stg-myinfo-2018.pem
set MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT=./ssl/stg-auth-signing-public.pem

set MYINFO_APP_CLIENT_ID=STG2-MYINFO-SELF-TEST
set MYINFO_APP_CLIENT_SECRET MYINFO_APP_CLIENT_SECRET=44d953c796cccebcec9bdc826852857ab412fbe2
set MYINFO_APP_REDIRECT_URL=http://localhost:3001/callback
set MYINFO_APP_REALM=http://localhost:3001

rem L0 APIs
rem set AUTH_LEVEL=L0
rem set MYINFOBIZ_API_AUTHORISE=https://myinfosgstg.api.gov.sg/biz/dev/v1/authorise
rem set MYINFOBIZ_API_TOKEN=https://myinfosgstg.api.gov.sg/biz/dev/v1/token
rem set MYINFOBIZ_API_PERSON=https://myinfosgstg.api.gov.sg/biz/dev/v1/entity-person

rem L0 APIs AWS
set AUTH_LEVEL=L0
set MYINFOBIZ_API_AUTHORISE='https://sandbox.api.myinfo.gov.sg/biz/v1/authorise'
set MYINFOBIZ_API_TOKEN='https://sandbox.api.myinfo.gov.sg/biz/v1/authorise'
set MYINFOBIZ_API_ENTITYPERSON='https://sandbox.api.myinfo.gov.sg/biz/v1/authorise'

rem L2 APIs
rem set AUTH_LEVEL=L2
rem set MYINFOBIZ_API_AUTHORISE=https://myinfosgstg.api.gov.sg/biz/test/v1/authorise
rem set MYINFOBIZ_API_TOKEN=https://myinfosgstg.api.gov.sg/biz/test/v1/token
rem set MYINFOBIZ_API_ENTITYPERSON=https://myinfosgstg.api.gov.sg/biz/test/v1/entity-person

rem L2 APIs AWS
rem set AUTH_LEVEL=L2
rem set MYINFOBIZ_API_AUTHORISE='https://test.api.myinfo.gov.sg/biz/v1/authorise'
rem set MYINFOBIZ_API_TOKEN='https://test.api.myinfo.gov.sg/biz/v1/authorise'
rem set MYINFOBIZ_API_ENTITYPERSON='https://test.api.myinfo.gov.sg/biz/v1/authorise'

npm start
