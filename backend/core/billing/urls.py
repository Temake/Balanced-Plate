from django.urls import path

from . import views


urlpatterns = [
    path("billing/plans/", views.ListBillingPlans.as_view(), name="billing-plans"),
    path("billing/subscription/", views.CurrentSubscription.as_view(), name="billing-subscription"),
    path("billing/usage/", views.BillingUsage.as_view(), name="billing-usage"),
    path("billing/demo-invites/", views.CreateDemoAccessInvite.as_view(), name="billing-demo-invite-create"),
    path("billing/demo-invites/redeem/", views.RedeemDemoAccessInvite.as_view(), name="billing-demo-invite-redeem"),
    path("billing/initialize/", views.InitializeSubscriptionPayment.as_view(), name="billing-initialize"),
    path("billing/verify/", views.VerifySubscriptionPayment.as_view(), name="billing-verify"),
    path("billing/webhooks/paystack/", views.PaystackWebhook.as_view(), name="paystack-webhook"),
]
