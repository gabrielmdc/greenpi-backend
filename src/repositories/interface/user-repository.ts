import { Repository } from "./repository";
import { User } from "../../models/interface/user";
import { RoleName } from "../../models/role-name";

export interface UserRepository extends Repository<User> {
  find(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  getRoleName(id: string): Promise<RoleName>;
  remove(id: string): Promise<User>;
  findByGoogleId(id: string): Promise<User>;
}
