export DEMO_APP_SIGNATURE_CERT_PRIVATE_KEY=./ssl/demoapp-client-privatekey-2018.pem
export MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT=./ssl/stg-auth-signing-public.pem

# Myinfo Biz
export MYINFO_APP_CLIENT_ID=STG2-MYINFO-SELF-TEST
export MYINFO_APP_CLIENT_SECRET=44d953c796cccebcec9bdc826852857ab412fbe2

export MYINFO_APP_REDIRECT_URL=http://localhost:3001/callback
export MYINFO_APP_REALM=http://localhost:3001


# SANDBOX ENVIRONMENT (no PKI digital signature)
export AUTH_LEVEL=L0
export MYINFOBIZ_API_AUTHORISE='https://sandbox.api.myinfo.gov.sg/biz/v1/authorise'
export MYINFOBIZ_API_TOKEN='https://sandbox.api.myinfo.gov.sg/biz/v1/token'
export MYINFOBIZ_API_ENTITYPERSON='https://sandbox.api.myinfo.gov.sg/biz/v1/entity-person'

# TEST ENVIRONMENT (with PKI digital signature)
# export AUTH_LEVEL=L2
# export MYINFOBIZ_API_AUTHORISE='https://test.api.myinfo.gov.sg/biz/v1/authorise'
# export MYINFOBIZ_API_TOKEN='https://test.api.myinfo.gov.sg/biz/v1/token'
# export MYINFOBIZ_API_ENTITYPERSON='https://test.api.myinfo.gov.sg/biz/v1/entity-person'


npm start
