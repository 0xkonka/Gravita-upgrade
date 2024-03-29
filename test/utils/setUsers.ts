import { Context } from "mocha";

import { SetUsersArgs } from "../shared/types";

export function setUsers(context: Context) {
  return async (args: SetUsersArgs) => {
    context.users = args;

    return context.users;
  };
}
