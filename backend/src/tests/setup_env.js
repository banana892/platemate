process.env.NODE_ENV = 'test'
// Override Razorpay keys so test signature generation matches provider's in-process key
process.env.RAZORPAY_KEY_ID = 'rzp_test_dummykeyid'
process.env.RAZORPAY_KEY_SECRET = 'dummysecret'
process.env.RAZORPAY_WEBHOOK_SECRET = 'dummywebhooksecret'
