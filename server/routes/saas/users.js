const express = require("express");

const router = express.Router();

const {
    getUsers,
    getUsersByHospital,
    getActiveUsersByHospital,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    suspendUser,
    getUsersByRole,
    getDoctors,
    getNurses,
    searchUsers,
    hasPermission,
    hasRole,
    hasHospitalAccess,
    sanitizeUser,
    sanitizeUsers,
    updateLastLogin,
    getUserStats,
    getRolePermissions,
    getAvailableRoles
} = require("../../models/user");

// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/",
    (req, res) => {

        try {

            const {
                hospitalId,
                role,
                status,
                search
            } = req.query;

            let users;

            if (hospitalId) {

                users =
                    getUsersByHospital(
                        hospitalId
                    );

            } else {

                users =
                    getUsers();
            }

            if (role) {

                users =
                    users.filter(
                        user =>
                            user.role ===
                            role
                    );
            }

            if (status) {

                users =
                    users.filter(
                        user =>
                            user.status ===
                            status
                    );
            }

            if (search) {

                const query =
                    String(search)
                        .trim()
                        .toLowerCase();

                users =
                    users.filter(
                        user => {

                            return (

                                String(
                                    user.name || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                String(
                                    user.username || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                String(
                                    user.email || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                String(
                                    user.role || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                String(
                                    user.department || ""
                                )
                                    .toLowerCase()
                                    .includes(query)
                            );
                        }
                    );
            }

            res.json({

                success: true,

                count:
                    users.length,

                users:
                    sanitizeUsers(
                        users
                    )
            });

        } catch (error) {

            console.error(
                "Get users error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET AVAILABLE ROLES
// =====================================================

router.get(
    "/roles",
    (req, res) => {

        try {

            res.json({

                success: true,

                roles:
                    getAvailableRoles()
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET ROLE PERMISSIONS
// =====================================================

router.get(
    "/roles/:role/permissions",
    (req, res) => {

        try {

            const permissions =
                getRolePermissions(
                    req.params.role
                );

            res.json({

                success: true,

                role:
                    req.params.role,

                permissions
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET USERS BY HOSPITAL
// =====================================================

router.get(
    "/hospital/:hospitalId",
    (req, res) => {

        try {

            const users =
                getUsersByHospital(
                    req.params.hospitalId
                );

            res.json({

                success: true,

                hospitalId:
                    req.params.hospitalId,

                count:
                    users.length,

                users:
                    sanitizeUsers(
                        users
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// ACTIVE USERS BY HOSPITAL
// =====================================================

router.get(
    "/hospital/:hospitalId/active",
    (req, res) => {

        try {

            const users =
                getActiveUsersByHospital(
                    req.params.hospitalId
                );

            res.json({

                success: true,

                hospitalId:
                    req.params.hospitalId,

                count:
                    users.length,

                users:
                    sanitizeUsers(
                        users
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// DOCTORS
// =====================================================

router.get(
    "/hospital/:hospitalId/doctors",
    (req, res) => {

        try {

            const doctors =
                getDoctors(
                    req.params.hospitalId
                );

            res.json({

                success: true,

                hospitalId:
                    req.params.hospitalId,

                count:
                    doctors.length,

                doctors:
                    sanitizeUsers(
                        doctors
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// NURSES
// =====================================================

router.get(
    "/hospital/:hospitalId/nurses",
    (req, res) => {

        try {

            const nurses =
                getNurses(
                    req.params.hospitalId
                );

            res.json({

                success: true,

                hospitalId:
                    req.params.hospitalId,

                count:
                    nurses.length,

                nurses:
                    sanitizeUsers(
                        nurses
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// SEARCH USERS
// =====================================================

router.get(
    "/hospital/:hospitalId/search",
    (req, res) => {

        try {

            const {
                q
            } = req.query;

            const users =
                searchUsers(
                    req.params.hospitalId,
                    q || ""
                );

            res.json({

                success: true,

                hospitalId:
                    req.params.hospitalId,

                count:
                    users.length,

                users:
                    sanitizeUsers(
                        users
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// USER STATISTICS
// =====================================================

router.get(
    "/hospital/:hospitalId/stats",
    (req, res) => {

        try {

            const stats =
                getUserStats(
                    req.params.hospitalId
                );

            res.json({

                success: true,

                stats
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET USER BY USERNAME
// =====================================================

router.get(
    "/hospital/:hospitalId/username/:username",
    (req, res) => {

        try {

            const user =
                getUserByUsername(
                    req.params.username,
                    req.params.hospitalId
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET USER BY EMAIL
// =====================================================

router.get(
    "/hospital/:hospitalId/email/:email",
    (req, res) => {

        try {

            const user =
                getUserByEmail(
                    req.params.email,
                    req.params.hospitalId
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// CREATE USER
// =====================================================

router.post(
    "/",
    (req, res) => {

        try {

            const user =
                createUser(
                    req.body
                );

            res.status(
                201
            ).json({

                success: true,

                message:
                    "User created successfully",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(
                400
            ).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// GET USER BY ID
// =====================================================

router.get(
    "/:id",
    (req, res) => {

        try {

            const user =
                getUserById(
                    req.params.id
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// UPDATE USER
// =====================================================

router.patch(
    "/:id",
    (req, res) => {

        try {

            const user =
                updateUser(
                    req.params.id,
                    req.body
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                message:
                    "User updated successfully",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// ACTIVATE USER
// =====================================================

router.patch(
    "/:id/activate",
    (req, res) => {

        try {

            const user =
                activateUser(
                    req.params.id
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                message:
                    "User activated successfully",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// DEACTIVATE USER
// =====================================================

router.patch(
    "/:id/deactivate",
    (req, res) => {

        try {

            const user =
                deactivateUser(
                    req.params.id
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                message:
                    "User deactivated successfully",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// SUSPEND USER
// =====================================================

router.patch(
    "/:id/suspend",
    (req, res) => {

        try {

            const user =
                suspendUser(
                    req.params.id
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                message:
                    "User suspended successfully",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// CHECK HOSPITAL ACCESS
// =====================================================

router.get(
    "/:id/access/:hospitalId",
    (req, res) => {

        try {

            const allowed =
                hasHospitalAccess(
                    req.params.id,
                    req.params.hospitalId
                );

            res.json({

                success: true,

                userId:
                    req.params.id,

                hospitalId:
                    req.params.hospitalId,

                allowed
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// CHECK PERMISSION
// =====================================================

router.get(
    "/:id/permission/:permission",
    (req, res) => {

        try {

            const allowed =
                hasPermission(
                    req.params.id,
                    req.params.permission
                );

            res.json({

                success: true,

                userId:
                    req.params.id,

                permission:
                    req.params.permission,

                allowed
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// CHECK ROLE
// =====================================================

router.get(
    "/:id/role/:role",
    (req, res) => {

        try {

            const allowed =
                hasRole(
                    req.params.id,
                    req.params.role
                );

            res.json({

                success: true,

                userId:
                    req.params.id,

                role:
                    req.params.role,

                allowed
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// UPDATE LAST LOGIN
// =====================================================

router.patch(
    "/:id/login",
    (req, res) => {

        try {

            const user =
                updateLastLogin(
                    req.params.id
                );

            if (!user) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "User not found"
                });
            }

            res.json({

                success: true,

                message:
                    "Last login updated",

                user:
                    sanitizeUser(
                        user
                    )
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    error.message
            });
        }
    }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;