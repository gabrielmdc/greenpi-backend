import { Rule } from "@/services/authz.service/rule";
import { RoleName } from "@/services/authz.service/role-name";
import { HttpMethod } from "@/services/authz.service/http-method";
import { rulesData } from "@/services/authz.service/rules-data";
import * as Config from "@/config";

export class Authz {
  private rules: Map<string, Rule[]>;

  constructor() {
    this.setRules();
  }

  isAuthorized(
    roleName: RoleName,
    path: string,
    httpMethod: HttpMethod | string
  ): Promise<boolean> {
    /**
     * If the path does not exist in 'rules', the role-name is admin
     */
    const apiRoute = this.getApiRoute();
    path = path.replace(apiRoute, "");
    const roleNames = this.getRoleNamesAuthorized(path, httpMethod);

    const roleNameFounded = roleNames.find(r => r === roleName);
    const isAuthorized = roleNameFounded != undefined;
    return Promise.resolve(isAuthorized);
  }

  private getRoleNamesAuthorized(
    path: string,
    httpMethod: HttpMethod | string
  ): RoleName[] {
    const roleNamesByDefault = [RoleName.Admin];
    // Get the rules by key which is the path
    const rules = this.rules.get(path);
    // If there are not rules, it returns the roles 'roleNamesByDefault'
    if (!rules || rules.length == 0) {
      return roleNamesByDefault;
    }
    const ruleFounded = rules.find(r => r.httpMethod === httpMethod);
    // If there are any rule founded, it returns the roles 'roleNamesByDefault'
    // Otherwise, it returns all the role names
    // of that method from that path
    const roleNames = ruleFounded ? ruleFounded.roleNames : roleNamesByDefault;
    return roleNames;
  }

  private setRules() {
    this.rules = rulesData;
  }

  private getApiRoute() {
    const apiVersion = Config.Server.VERSION.split(".");
    const apiRoute = "/api/v" + apiVersion[0];
    return apiRoute;
  }
}
