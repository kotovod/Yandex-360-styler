import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

// User Model
export class User extends Model {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare name: string;
  declare email_verified: boolean;
  declare createdAt: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'users',
  underscored: true,
});

// TherapySession Model
export class TherapySession extends Model {
  declare id: string;
  declare user_id: string;
  declare start_date: string;
  declare maintenance_dose: number;
  declare reminder_time: string;
  declare createdAt: Date;
}

TherapySession.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  maintenance_dose: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2,
      max: 4,
    },
  },
  reminder_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'therapy_sessions',
  underscored: true,
});

// Dose Model
export class Dose extends Model {
  declare id: string;
  declare therapy_session_id: string;
  declare date: string;
  declare taken: boolean;
  declare dose_count: number | null;
  declare concentration: string | null;
  declare notes: string | null;
  declare createdAt: Date;
}

Dose.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  therapy_session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: TherapySession,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  taken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  dose_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  concentration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'doses',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['therapy_session_id', 'date'],
    },
  ],
});

// SideEffect Model
export class SideEffect extends Model {
  declare id: string;
  declare dose_record_id: string;
  declare date: string;
  declare type: string;
  declare severity: string;
  declare description: string | null;
  declare createdAt: Date;
}

SideEffect.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  dose_record_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Dose,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'side_effects',
  underscored: true,
});

// PushSubscription Model
export class PushSubscription extends Model {
  declare id: string;
  declare user_id: string;
  declare endpoint: string;
  declare keys: string;
  declare createdAt: Date;
}

PushSubscription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  keys: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'push_subscriptions',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'endpoint'],
    },
  ],
});

// Associations
User.hasOne(TherapySession, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TherapySession.belongsTo(User, { foreignKey: 'user_id' });

TherapySession.hasMany(Dose, { foreignKey: 'therapy_session_id', onDelete: 'CASCADE' });
Dose.belongsTo(TherapySession, { foreignKey: 'therapy_session_id' });

Dose.hasMany(SideEffect, { foreignKey: 'dose_record_id', onDelete: 'CASCADE' });
SideEffect.belongsTo(Dose, { foreignKey: 'dose_record_id' });

User.hasMany(PushSubscription, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PushSubscription.belongsTo(User, { foreignKey: 'user_id' });

// VerificationCode Model
export class VerificationCode extends Model {
  declare id: string;
  declare email: string;
  declare code: string;
  declare type: 'email_verification' | 'password_reset';
  declare expires_at: Date;
  declare used: boolean;
  declare createdAt: Date;
}

VerificationCode.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'verification_codes',
  underscored: true,
  indexes: [
    {
      fields: ['email', 'code', 'type'],
    },
  ],
});

export const models = {
  User,
  TherapySession,
  Dose,
  SideEffect,
  PushSubscription,
  VerificationCode,
};
