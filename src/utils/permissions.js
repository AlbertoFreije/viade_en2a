import {
  AccessControlList,
  AppPermission,
} from "@inrupt/solid-react-components";
import { errorToaster } from "@utils";

// Check that all permissions we need are set. If any are missing, this returns false
const checkAppPermissions = (userAppPermissions, appPermissions) =>
  appPermissions.every((permission) => userAppPermissions.includes(permission));

// Function to check for a specific permission included in the app
export const checkSpecificAppPermission = async (webId, permission) => {
  const userAppPermissions = await AppPermission.checkPermissions(webId);
  return userAppPermissions.permissions.includes(permission);
};
/**
 * SDK app will need all the permissions by the user pod so we check these permissions to work without any issues.
 * Error Message object is to hold the title, message, etc strings, as we can't use i18n libraries in this non-React file
 */
export const checkPermissions = async (webId, errorMessage) => {
  /**
   * Get permissions from trustedApp.
   */
  const userApp = await AppPermission.checkPermissions(webId);

  /**
   * Get modes permissions from solid-react-components
   */
  const permissions = AccessControlList.MODES;
  const { APPEND, READ, WRITE, CONTROL } = permissions;

  // If we are missing permissions that the app requires, display an error message with a Learn More link
  if (
    userApp === null ||
    userApp.permissions === null ||
    !checkAppPermissions(userApp.permissions, [APPEND, READ, WRITE, CONTROL])
  ) {
    errorToaster(errorMessage.message, errorMessage.title, {
      label: errorMessage.label,
      href: errorMessage.href,
    });
  }
};

/**
 * Helper function to fetch permissions for the game inbox, and if permissions are not set
 * correctly, then add them. This repairs a broken inbox.
 * @param inboxPath
 * @returns {Promise<void>}
 */
export const checkOrSetInboxAppendPermissions = async (inboxPath, webId) => {
  // Fetch app permissions for the inbox and see if Append is there
  const urlacl = `${inboxPath}.acl`;
  const inboxAcls = new AccessControlList(webId, inboxPath, urlacl);
  const permissions = await inboxAcls.getPermissions();
  const inboxPublicPermissions = permissions.filter(
    (perm) => perm.agents === null
  );

  const appendPermission = inboxPublicPermissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.APPEND)
  );

  if (appendPermission.length <= 0) {
    // What do we do when the permission is missing? Add it!
    try {
      // Permission object to add. A null agent means Everyone
      const permissions = [
        {
          agents: null,
          modes: [AccessControlList.MODES.APPEND],
        },
      ];
      const urlacl = `${inboxPath}.acl`;
      const ACLFile = new AccessControlList(webId, inboxPath, urlacl);
      await ACLFile.createACL(permissions);
    } catch (error) {
      // TODO: Better error handling here
      throw error;
    }
  }

  return true;
};

export const checkOrSetSettingsReadPermissions = async (inboxPath, webId) => {
  // Fetch app permissions for the inbox and see if Append is there
  const urlacl = `${inboxPath}.acl`;
  const inboxAcls = new AccessControlList(webId, inboxPath, urlacl);
  const permissions = await inboxAcls.getPermissions();
  const inboxPublicPermissions = permissions.filter(
    (perm) => perm.agents === null
  );

  const appendPermission = inboxPublicPermissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.READ)
  );

  if (appendPermission.length <= 0) {
    // What do we do when the permission is missing? Add it!
    try {
      // Permission object to add. A null agent means Everyone
      const permissions = [
        {
          agents: null,
          modes: [AccessControlList.MODES.READ],
        },
      ];
      const urlacl = `${inboxPath}.acl`;
      const ACLFile = new AccessControlList(webId, inboxPath, urlacl);
      await ACLFile.createACL(permissions);
    } catch (error) {
      // TODO: Better error handling here
      throw error;
    }
  }

  return true;
};

/**
 * Helper function to fetch permissions for the game inbox, and if permissions are not set
 * correctly, then add them. This repairs a broken inbox.
 * @param inboxPath
 * @returns {Promise<void>}
 */
export const setReadPermissions = async (path, webId, agent) => {
  // Fetch app permissions for the inbox and see if Append is there
  
  const urlacl = `${path}.acl`;
  const acls = new AccessControlList(webId, path, urlacl);
  const permissions = await acls.getPermissions();
  const publicPermissions = permissions.filter((perm) => perm.agents === agent);

  const readPermission = publicPermissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.READ)
  );
  const allPermissions = permissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.READ)
  );
  const ACLFile = new AccessControlList(webId, path, urlacl);
  if (readPermission.length <= 0) {
    // What do we do when the permission is missing? Add it!
    for (let i = 0; i < allPermissions.length; i++) {
      if (allPermissions[i].modes.length === 1) {
        if (allPermissions[i].agents === null) {
          try {
            // Permission object to add. A null agent means Everyone
            const permissions = [
              {
                agents: [agent],
                modes: [AccessControlList.MODES.READ],
              },
            ];
            await ACLFile.createACL(permissions);
          } catch (error) {
            // TODO: Better error handling here
            throw error;
          }
        } else {
          let newAgents = allPermissions[i].agents;
          newAgents.push(agent);
          const newPermissions = [
            {
              agents: newAgents,
              modes: [AccessControlList.MODES.READ],
            },
          ];
          await ACLFile.createACL(newPermissions);
        }
      }
    }
  }

  return true;
};

export const setReadWritePermissions = async (path, webId, agent) => {
  // Fetch app permissions for the inbox and see if Append is there
  
  const urlacl = `${path}.acl`;
  const acls = new AccessControlList(webId, path, urlacl);
  const permissions = await acls.getPermissions();
  const publicPermissions = permissions.filter((perm) => perm.agents === agent);

  const readPermission = publicPermissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.READ)
  );
  const allPermissions = permissions.filter((perm) =>
    perm.modes.includes(AccessControlList.MODES.READ)
  );
  const ACLFile = new AccessControlList(webId, path, urlacl);
  if (readPermission.length <= 0) {
    // What do we do when the permission is missing? Add it!
    for (let i = 0; i < allPermissions.length; i++) {
      if (
        allPermissions[i].modes.length === 2 ||
        allPermissions[i].modes.length === 1
      ) {
        if (allPermissions[i].agents === null) {
          try {
            // Permission object to add. A null agent means Everyone
            const permissions = [
              {
                agents: [agent],
                modes: [
                  AccessControlList.MODES.READ,
                  AccessControlList.MODES.WRITE,
                ],
              },
            ];
            await ACLFile.createACL(permissions);
          } catch (error) {
            // TODO: Better error handling here
            throw error;
          }
        } else {
          let newAgents = allPermissions[i].agents;
          newAgents.push(agent);
          const newPermissions = [
            {
              agents: newAgents,
              modes: [
                AccessControlList.MODES.READ,
                AccessControlList.MODES.WRITE,
              ],
            },
          ];
          await ACLFile.createACL(newPermissions);
        }
      }
    }
  }

  return true;
};
