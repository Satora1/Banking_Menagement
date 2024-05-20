"use server"

import { ID } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { encryptId, parseStringify } from "../utils"
import { plaidClient } from "../plaid"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { revalidatePath } from "next/cache"
import { addFundingSource } from "./dwolla.actions"

export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const response = await account.createEmailPasswordSession(email, password)
        return parseStringify(response);
    } catch (error) {
        console.log("Error", error)
    }
}

export const signUp = async (userData: SignUpParams) => {

    const { email, password, firstName, lastName } = userData
    try {
        const { account } = await createAdminClient();

        const newUserAcount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`);

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify(newUserAcount)
    } catch (error) {
        console.log("Error", error)
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const loggoutAccount = async () => {
    try {
        const { account } = await createSessionClient()
        cookies().delete("appwrite-session")
        await account.deleteSession("current")
    } catch (error) {
        return null
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: user.name,
            products: ["auth"] as Products[],
            language: 'en',
            country_codes: ["US"] as CountryCode[]
        }
        const response = await plaidClient.linkTokenCreate(tokenParams)
        return parseStringify({ linkToken: response.data.link_token })
    } catch (error) {

        console.log(error)
    }
}

export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        const response = await plaidClient.
            itemPublicTokenExchange({
                public_token: publicToken,
            })
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id

        //Get account information from plaid using token
        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        })
        const accountData = accountResponse.data.accounts[0]
        //create a processor token for dwolla using acess token and account id
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
        }

        const processorTokenResponse = await plaidClient.processorTokenCreate(request)
        const processorToken = processorTokenResponse.data.processor_token
        //create a founding source URL for account using dwolla
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name
        })
        if (!fundingSourceUrl) throw Error;
        //create bank account using user id item id account id acess token
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharabledId: encryptId(accountData.account_id)
        })
        revalidatePath("/")
        return parseStringify({
            publicTokenExchange: "Complete",
        })
    } catch (error) {
        console.error("An error occurred while creating exchanging token:", error)
    }

}