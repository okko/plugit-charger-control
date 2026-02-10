const ORY_BASE = 'https://ory.plugitcloud.com';
const GW_BASE = 'https://app-gw.plugitcloud.com';

export async function login(): Promise<string> {
  // Step 1: Initialize Ory Kratos login flow
  const flowRes = await fetch(`${ORY_BASE}/self-service/login/api`);
  if (!flowRes.ok) {
    throw new Error(`Failed to init login flow: ${flowRes.status} ${await flowRes.text()}`);
  }
  const flow = await flowRes.json();
  const flowId = flow.id;

  // Step 2: Submit credentials to Ory
  const loginRes = await fetch(`${ORY_BASE}/self-service/login?flow=${flowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'password',
      identifier: process.env.PLUGIT_USERNAME,
      password: process.env.PLUGIT_PASSWORD,
    }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const loginData = await loginRes.json();
  const sessionToken = loginData.session_token;
  if (!sessionToken) {
    throw new Error('No session_token in login response');
  }

  // Step 3: Register session with Plugit backend to get API access token
  const regRes = await fetch(`${GW_BASE}/users/register-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: sessionToken }),
  });
  if (!regRes.ok) {
    throw new Error(`Register session failed: ${regRes.status} ${await regRes.text()}`);
  }
  const regData = await regRes.json();
  const accessToken = regData.accessToken;
  if (!accessToken) {
    throw new Error('No accessToken in register-session response');
  }

  return accessToken;
}

export async function getStatus(
  accessToken: string,
): Promise<'Unavailable' | 'Available' | 'Preparing' | 'Charging' | 'SuspendedEV' | 'SuspendedEVSE' | 'Finishing' | 'ERROR'> {
  const chargePointId = process.env.PLUGIT_CHARGE_POINT_ID;
  const chargeBoxId = process.env.PLUGIT_CHARGE_BOX_ID;

  const res = await fetch(`${GW_BASE}/charge-points/user-charge-points`, {
    headers: { Authorization: accessToken },
  });
  if (!res.ok) {
    console.error(`getStatus failed: ${res.status} ${await res.text()}`);
    return 'ERROR';
  }
  const chargePoints = await res.json();

  // Find the matching charge box in the nested structure
  for (const cp of chargePoints) {
    if (cp._id !== chargePointId) continue;
    for (const group of cp.chargeBoxGroups) {
      for (const box of group.chargeBoxes) {
        if (box._id === chargeBoxId) {
          return box.status;
        }
      }
    }
  }

  console.error(`Charge box ${chargeBoxId} not found in charge point ${chargePointId}`);
  return 'ERROR';
}

export async function startCharging(accessToken: string): Promise<boolean> {
  const chargePointId = process.env.PLUGIT_CHARGE_POINT_ID;
  const chargeBoxId = process.env.PLUGIT_CHARGE_BOX_ID;

  const res = await fetch(`${GW_BASE}/remote-start-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({
      chargePointId,
      chargeBoxId,
    }),
  });

  if (!res.ok) {
    console.error(`startCharging failed: ${res.status} ${await res.text()}`);
    return false;
  }

  return true;
}
