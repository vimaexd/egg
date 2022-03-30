export const isDev = (process.env.NODE_ENV != "production")
export const getFluteGangId = () => {
  if(isDev) return "606089486660534296"
  else return "660909173281652807"
}

export enum PermissionGroup {
  NONE = "none",
  ALL_STAFF = "staff",
  MODERATOR = "mods",
  ADMIN = "admin",
  OWNER = "owner",
  BOT_OWNER = "mae"
}

export const getPermissionRoles = () => {
  let PermissionRoles: {[key: string]: string[]} = {};

  PermissionRoles[PermissionGroup.MODERATOR] = ["661408853589753866"];
  PermissionRoles[PermissionGroup.ADMIN]     = ["660914705170169857"];
  PermissionRoles[PermissionGroup.OWNER]     = ["660914458365001756", "696895749350490194"];
  PermissionRoles[PermissionGroup.BOT_OWNER] = ["675431621452759050"];
  PermissionRoles[PermissionGroup.ALL_STAFF] = ([] as string[]).concat(
    PermissionRoles[PermissionGroup.MODERATOR],
    PermissionRoles[PermissionGroup.ADMIN],
    PermissionRoles[PermissionGroup.OWNER]
  )

  return PermissionRoles;
}