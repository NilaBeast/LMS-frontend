import { createPaymentOrderApi, verifyPaymentApi } from "../api/auth.api";

export const startPayment = async ({
  productId,
  productType,
  token,
  onSuccess
}) => {

  const order = await createPaymentOrderApi(
    productId,
    productType,
    token
  );

  const { orderId, paymentSessionId } = order.data;

  const cashfree = window.Cashfree({
    mode: "sandbox",
  });

  cashfree.checkout({
    paymentSessionId,
    redirectTarget: "_modal",
  }).then(async (result) => {

    if (result.paymentDetails) {

      await verifyPaymentApi(
        orderId,
        result.paymentDetails.paymentId,
        token
      );

      onSuccess?.();

    }

  });
};