This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**********************************************************************************************************************************************************************************************************************************

## Usage of this website (user documentation)

On the browser, there are 2 links. "Register" is used to register (create a new account). "Login" is used to login to an existing account.

When registering, create a new username. If you choose a username that already exists, the system will display "User already exists." in the console (the one where "npm run dev" is running).

When entering the password, it must be entered exactly the same way twice. 2 passwords that do not match will cause the account creation to fail, with an error message: "Password and confirm password do not match."

Below the field to re-enter the password, there is a QR code and a 16-character alphanumeric code. Please use an authenticator that complies with the RFC 6238 standard (such as Microsoft Authenticator, Google Authenticator, WinAuth, KeePassXC), scan the QR code or enter the 16-character code into that authenticator. You will see a 6-digit code that refreshes periodically. Enter it on the field labelled "Initial verification code". This system will only accept the code you see on the authenticator. If the incorrect code is entered,  an error message of "Invalid 2FA verification code. Please try again." will appear.

If the username you chose is not in the system, both passwords match, and you enter the correct authenticator code, your account will be created.

After the account is successfully created, you may proceed to log in with the username and password you chose, along with the new 6 digit code that displayed on the authenticator. If everything matches, you will be logged in.

You will see an empty page when you log in for the first time. You can create a trip, or someone can add you to an existing trip if you provide them your username.

Once a trip is created, it can be edited or deleted. You can choose to add another user to the trip if you know their username.

You can choose to leave a trip that you are a part of. If you are the only user on a trip and you leave it, it will be deleted. 



**********************************************************************************************************************************************************************************************************************************

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


