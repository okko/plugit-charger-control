# Plugit App API Endpoints

## Base URLs

| Service | URL |
|---------|-----|
| **App Gateway** | `https://app-gw.plugitcloud.com` |
| **Auth (Ory)** | `https://ory.plugitcloud.com` |
| **WebSocket** | `https://socket.plugitcloud.com/` |
| **User Service** | `https://user-service.plugitcloud.com` |

## Authentication (Ory Kratos)

| Path | Description |
|------|-------------|
| `/self-service/login/api` | Login |
| `/self-service/logout/api` | Logout |
| `/self-service/registration/api` | Registration |
| `/self-service/recovery/api` | Password recovery |
| `/self-service/settings/api` | Account settings |
| `/self-service/verification` | Email verification |

## User Service

| Path | Description |
|------|-------------|
| `/check-if-user-exists` | POST - Check if user exists |
| `/users` | Users |
| `/users/register-session` | Register session |
| `/users/change-email` | Change email |
| `/users/favorites` | User favorites |
| `/users/fcm-token` | Store FCM push token |
| `/users/logout` | Logout |
| `/users/tos` | Terms of service acceptance |
| `/user/delete` | Delete account |

## Charge Points / Stations

| Path | Description |
|------|-------------|
| `/charge-points/public-charge-points` | List public charge points |
| `/charge-points/public-charge-points-coords` | Public charge points (coordinates only) |
| `/charge-points/user-charge-points` | User's own charge points |
| `/charge-points/user-whitelisted-charge-points` | Whitelisted charge points |
| `/charge-point/` | Single charge point details |

## Charging Operations

| Path | Description |
|------|-------------|
| `/remote-start-transaction` | Start charging remotely |
| `/remote-stop-transaction` | Stop charging remotely |
| `/transactions/active` | Get active transactions |
| `/transactions/socket` | Register socket for transaction updates |
| `/transaction-price/socket` | Register socket for price updates |

## Roaming (Hubject)

| Path | Description |
|------|-------------|
| `/hubject/chargers/` | List Hubject roaming chargers |
| `/hubject/evse-data-with-pricing` | EVSE data with pricing |
| `/hubject/evse-data-with-pricing-coords` | EVSE data with pricing (coords) |
| `/hubject/evse/` | Single EVSE details |
| `/hubject/remote-charge-authorization` | Authorize roaming charge |
| `/hubject/charge-detail-records/recent` | Recent charge detail records |
| `/hubject/transactions/socket` | Register socket for Hubject tx updates |

## Transactions & Reports

| Path | Description |
|------|-------------|
| `/transactions/` | List transactions |
| `/transactions/user-group/` | User group transactions |
| `/v2/transactions/recent` | Recent transactions (v2) |
| `/v2/monthly-transactions` | Monthly transactions (v2) |
| `/monthly-invoices/current-month/charging-report` | Current month charging report |

## Invoices & Payments

| Path | Description |
|------|-------------|
| `/invoices` | List invoices |
| `/v2/monthly-invoices/pay` | Pay monthly invoice |
| `/monthly-invoices/download/receipt` | Download invoice receipt |
| `/payment-card` | Payment card management |
| `/orders/user` | User orders |

## User Groups

| Path | Description |
|------|-------------|
| `/user-groups` | List user groups |
| `/user-groups/` | User group details |
| `/user-groups/invitation-codes/` | Group invitation codes |
| `/user-groups/invitations` | Group invitations |

## Other

| Path | Description |
|------|-------------|
| `/notifications` | Notifications |
| `/tickets/feedback` | Submit feedback/support ticket |

## WebSocket Events

The app registers socket IDs for real-time updates via:
- **Transaction updates** (`registerSocketIdTransations`)
- **Transaction pricing** (`registerSocketIdTransactionsPrices`)
- **Charge point status** (`registerSocketIdChargePoint`)
- **Hubject transactions** (`registerSocketIdHubjectTransations`)

## Notes

- The app uses OCPP 1.5 SOAP for charger communication (`ocppStandard: ocpp-15-soap`).
- The app is built with Flutter and uses Firebase for push notifications and remote config.
- Payments are handled via Stripe.
- Policies are served from `https://policies.plugitcloud.com/`.
