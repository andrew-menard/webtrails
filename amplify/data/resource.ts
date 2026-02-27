import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { AddEnvironmentFactory } from "@aws-amplify/backend-function";
import { ConstructFactory, ResourceProvider, FunctionResources, ResourceAccessAcceptorFactory, StackProvider } from "@aws-amplify/plugin-types";
const schema = a.schema({
 UserProfile: a.model({
 email: a.string(),
 profileOwner: a.string(),
 revealedSteps: a.string().array(),
 analyzedSteps: a.string().array(),
 })
 .authorization((allow: { authenticated: () => any; ownerDefinedIn: (arg0: string) => any; }) => [
 allow.authenticated().to(['create', 'read']),
 allow.ownerDefinedIn("profileOwner").to(['update', 'delete', 'read']),
 ]),
 TrailSteps: a.model({
 stepName: a.string(),
 analyze: a.string(),
 result: a.string(),
 })
 .authorization((allow: { authenticated: () => any; }) => [
   // any authenticated user can read and update all records
   allow.authenticated(),
 ]),
 })
 .authorization((allow: { resource: (arg0: ConstructFactory<ResourceProvider<FunctionResources> & ResourceAccessAcceptorFactory & AddEnvironmentFactory & StackProvider>) => any; }) => [allow.resource(postConfirmation)]);
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
 schema,
 authorizationModes: {
 defaultAuthorizationMode: "apiKey",
 apiKeyAuthorizationMode: {
 expiresInDays: 30,
 },
 },
})