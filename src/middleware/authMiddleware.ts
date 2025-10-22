import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import AuthenticationError from '../error/AuthenticationError'; 
import AuthorizationError from '../error/AuthorizationError';
import InternalServerError from '../error/InternalServerError';

// Extend Request object to include the user's role
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

// Initialize Supabase Client for client-token verification (No Service Role Key here)
// This client is used to *verify* the client-provided JWT against the Supabase instance.
const supabase = createClient(
    process.env.SUPABASE_URL as string, 
    process.env.SUPABASE_ANON_KEY as string, 
    { auth: { persistSession: false } }
);

//   Middleware to check if a user is authenticated and has one of the required roles.
//  @param requiredRoles An array of roles (e.g., ['super_admin', 'manager'])
const authMiddleware = (requiredRoles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new AuthenticationError('Bearer token missing or malformed.', null));
            }

            const token = authHeader.split(' ')[1];

            // Verify the JWT token with Supabase
            // This verifies the signature and checks expiry
            const { data, error } = await supabase.auth.getUser(token);

            if (error) {
                // Supabase error handling can be specific (e.g., token expired)
                return next(new AuthenticationError('Invalid or expired authentication token.', error));
            }

            const user = data.user;
            if (!user) {
                return next(new AuthenticationError('Authentication failed. User not found.', null));
            }

            // Extract the custom role from the user's metadata (this is set during sign-up/role change)
            const userRole = (user.app_metadata.roles as string[] | undefined)?.find(role => requiredRoles.includes(role)) || user.role;

            // Attach user data to the request
            req.user = {
                id: user.id,
                email: user.email!,
                role: userRole ? userRole : 'authenticated' 
            };

            // Check for required roles
            if (requiredRoles.length > 0) {
                if (!requiredRoles.includes(userRole!)) {
                    return next(new AuthorizationError(`Access denied. Role '${userRole}' is not permitted for this action.`, null));
                }
            }

            next();
        } catch (error) {
            // Catch any unexpected errors (e.g., network issues with Supabase)
            return next(new InternalServerError('Authentication service unavailable.', error as Error));
        }
    };
};

export default authMiddleware;