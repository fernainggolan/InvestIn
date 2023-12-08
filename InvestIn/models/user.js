'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsToMany(models.Investment,{
      //   through : models.UserInvestment
      // })
      this.hasMany(models.UserInvestment);
      this.belongsTo(models.Wallet)
    }
  }
  User.init({
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:`Nama harus diisi`
        },
        notEmpty:{
          msg:`Nama harus diisi`
        },
        len: {
          args: [6, 50],
          msg: 'Name must be at least 6 characters'
        }
      }
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate:{
        isEmail:{
          msg:`Email harus berupa fornat email`
        },
        notNull:{
          msg:`Email harus diisi`
        },
        notEmpty:{
          msg:`Email harus diisi`
        }
      }
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:`Password harus diisi`
        },
        notEmpty:{
          msg:`Password harus diisi`
        },
        customValidator(value) {
          if (value.length <8 ) {
            throw new Error("Password minimal 8 karakter");
          }
        }
      }
    },
    role: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:`Role Harus dipilih`
        },
        notEmpty:{
          msg:`Role harus dipilih`
        }
      }
    },
    WalletId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((instance,option)=>{
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(instance.password,salt)
    instance.password=hash
  })
  return User;
};