const NGENIUS_API_URL = process.env.NGENIUS_API_URL!;
const NGENIUS_API_KEY = process.env.NGENIUS_API_KEY!;
const NGENIUS_OUTLET_REF = process.env.NGENIUS_OUTLET_REF!;

export async function getAccessToken(): Promise<string> {
  const response = await fetch(
    `${NGENIUS_API_URL}/identity/auth/access-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ni-identity.v1+json",
        Authorization: `Basic ${NGENIUS_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`N-Genius auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

interface CreateOrderParams {
  amount: number; // in fils (minor units): 1 AED = 100 fils
  reference: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
}

export async function createOrder(params: CreateOrderParams) {
  const accessToken = await getAccessToken();
  const baseUrl = process.env.PUBLIC_BASE_URL!;

  console.log("baseUrl", baseUrl);

  const body: Record<string, unknown> = {
    action: "SALE",
    amount: {
      currencyCode: "AED",
      value: params.amount,
    },
    merchantAttributes: {
      redirectUrl: `${baseUrl}/checkout/result`,
      cancelUrl: `${baseUrl}/checkout/cancel`,
      skipConfirmationPage: true,
    },
    merchantOrderReference: params.reference,
  };

  if (params.emailAddress) {
    body.emailAddress = params.emailAddress;
  }

  if (params.firstName || params.lastName) {
    body.billingAddress = {
      firstName: params.firstName ?? "",
      lastName: params.lastName ?? "",
      address1: params.address1 ?? "",
      address2: params.address2 ?? "",
      city: "Dubai",
      stateProvince: "Dubai",
      countryCode: "AE",
    };
  }

  const response = await fetch(
    `${NGENIUS_API_URL}/transactions/outlets/${NGENIUS_OUTLET_REF}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`N-Genius create order failed: ${error}`);
  }

  const data = await response.json();
  return {
    orderRef: data.reference as string,
    paymentUrl: data._links.payment.href as string,
  };
}

export async function getOrderStatus(orderRef: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${NGENIUS_API_URL}/transactions/outlets/${NGENIUS_OUTLET_REF}/orders/${orderRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.ni-payment.v2+json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get order status: ${response.status}`);
  }

  return response.json();
}
