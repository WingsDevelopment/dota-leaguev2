import React from "react";
import { isUserAdmin } from "../../app/common/constraints";

export const AdminGuard: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }
  return <>{children}</>;
};
