import { EventManagementDataSource } from "../config/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { userRepo } from "../utils/repositories"
import { UserRole } from "../utils/enums"

export const seedAdmin = async () => {

    const adminExists = await userRepo.findOne({ where: { email: "appdev.superuser@gmail.com" } });
    if (adminExists) return;

    const admin = userRepo.create({
        name: "Super Admin",
        email: "appdev.superuser@gmail.com",
        password: await bcrypt.hash("admin", 10),
        role: UserRole.ADMIN,
    });

    await userRepo.save(admin);
    console.log("Admin user created");
};
