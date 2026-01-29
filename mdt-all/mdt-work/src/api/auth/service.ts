import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database/prisma";

// Token generation helper functions

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";

export const generateAccessToken = (userId: string) => {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES };

  const token = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_SECRET || "access_secret",
    options
  );

  return token;
};




export const generateRefreshToken = (userId: string) => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES };

  const token = jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    options
  );

  return token;
};



// ---------- Services ----------

export const UserRegister = async (userData: {
  name: string;
  email: string;
  password: string;
  confirm_password: string;

}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  isSuccess: boolean;
}> => {
  try {
    const { name, email, password, confirm_password } = userData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
        isSuccess: false,
      };
    }

    if(password !== confirm_password){
      return {
        success: false,
        error: "Passwords do not match",
        isSuccess: false,
      };
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with simplified schema
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
      },
    });

    return {
      success: true,
      isSuccess: true,
      data: {
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Internal Server Error",
      isSuccess: false,
    };
  }
};


export const userLogin = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return { success: false, error: "Invalid email or password" };
  }



  const loginTrialRecord = await prisma.loginTrial.findFirst({
      where: { user_id: user.user_id },
      orderBy: { created_at: "desc" },
    });
    if (user.is_login_blocked) {
      const lastUpdated = loginTrialRecord?.updated_at || user.updatedAt;
      const timeDifference = new Date().getTime() - lastUpdated.getTime();
      const blockDuration = 15 * 60 * 1000; // 15 minutes

      if (timeDifference >= blockDuration) {
        await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            is_login_blocked: false,
            updatedAt: new Date(),
          },
        });

        await prisma.loginTrial.updateMany({
          where: { user_id: user.user_id },
          data: {
            trial_count: 0,
            updated_at: new Date(),
          },
        });
      } else {
        return {
          success: false,
          error:
            "Account locked. Too many failed login attempts. Try again in 15 minutes.",
        };
      }
    }


  const passwordMatch = await bcrypt.compare(password, user.password);
   if (!passwordMatch) {
      let trialCount = (loginTrialRecord?.trial_count || 0) + 1;

      if (loginTrialRecord) {
        await prisma.loginTrial.update({
          where: { id: loginTrialRecord.id },
          data: {
            trial_count: trialCount,
            updated_at: new Date(),
          },
        });
      } else {
        await prisma.loginTrial.create({
          data: {
            user_id: user.user_id,
            email: user.email,
            trial_count: trialCount,
            device_info:  null,
            updated_at: new Date(),
          },
        });
      }

      if (trialCount > 2) {
        await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            is_login_blocked: true,
            updatedAt: new Date(),
          },
        });

        return {
          success: false,
          error: "Too many failed login attempts. Account locked for 15 minutes.",
        };
      }

      return {
        success: false,
        error: "Invalid credentials",
      };
    }
    if (loginTrialRecord) {
      await prisma.loginTrial.update({
        where: { id: loginTrialRecord.id },
        data: {
          trial_count: 0,
          updated_at: new Date(),
        },
      });
    }
    await prisma.token.deleteMany({
      where: {
        user_id: user.user_id,
      },
    });

  const accessToken = generateAccessToken(user.user_id);
  const refreshToken = generateRefreshToken(user.user_id);

  await prisma.token.updateMany({
      where: {
        user_id: user.user_id,
        token_type: { in: ["access_token", "refresh_token"] },
      },
      data: { is_used: true },
    });



 await prisma.token.create({
      data: {
        user_id: user.user_id,
        token: accessToken,
        token_type: "access_token",
        is_used: false,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    await prisma.token.create({
      data: {
        user_id: user.user_id,
        token: refreshToken,
        token_type: "refresh_token",
        is_used: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });


  return {
    success: true,
    data: {
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
      },
      tokens: {
        accessToken,
        // refreshToken,
      },
    },
  };
};


export async function issueRefreshTokenForUser(
  userId: string,
  
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const refreshToken = generateRefreshToken(user.user_id);

    await prisma.token.updateMany({
      where: { user_id: user.user_id, token_type: "refresh_token" },
      data: { is_used: true },
    });

    await prisma.token.create({
      data: {
        user_id: user.user_id,
        token: refreshToken,
        token_type: "refresh_token",
        is_used: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

 

    return {
      success: true,
      data: {
        refreshToken,
        
      },
    };
  } catch (error: any) {
    console.error("Error issuing refresh token:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}

export async function generateAccessTokenFromRefresh(
  refreshToken: string,
  
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh_secret"
    ) as jwt.JwtPayload & { userId: string; type: string };

    if (decoded.type !== "refresh") {
      return { success: false, error: "Invalid token type" };
    }

    // Delete all other refresh tokens for this user
    await prisma.token.deleteMany({
      where: {
        user_id: decoded.userId,
        token: { not: refreshToken },
      },
    });

    const storedToken = await prisma.token.findFirst({
      where: {
        token: refreshToken,
        token_type: "refresh_token",
      },
    });

    if (!storedToken) {
      return { success: false, error: "Refresh token not found" };
    }

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Mark the refresh token as used
    await prisma.token.updateMany({
      where: { id: storedToken.id },
      data: { is_used: true },
    });

    // Generate new access token
    const accessToken = generateAccessToken(user.user_id);

    // Mark old access tokens as used
    await prisma.token.updateMany({
      where: { user_id: user.user_id, token_type: "access_token" },
      data: { is_used: true },
    });

    // Save new access token
    await prisma.token.create({
      data: {
        user_id: user.user_id,
        token: accessToken,
        token_type: "access_token",
        is_used: false,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        accessToken,
       }, 
    };
  } catch (error: any) {
    console.error("Error generating access token from refresh:", error);
    return {
      success: false,
      error: error.message.includes("jwt expired")
        ? "Invalid or expired refresh token"
        : "Internal Server Error"
    };
  }
}

