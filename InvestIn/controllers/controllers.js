const { Company, Investment, User, Wallet, UserInvestment, sequelize } = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const formatRupiah = require('../helpers/formatter')
class Controller {
    static home(req, res) {
        res.render('home')
    }
    static investmentList(req, res) {
        const userId = req.session.userId
        const { search, error } = req.query
        let options = {
            include: [UserInvestment, Company]
        }
        if (search) {
            options.where = {
                ...options.where,
                investmentName: {
                    [Op.iLike]: `%${search}%`
                }
            }
        }
        let user;
        let invest;
        User.findByPk(userId, {
            include: Wallet
        })
            .then((users) => {
                user = users
                return Investment.findAll(options)
            })
            .then((investment) => {
                // console.log(user)
                invest = investment
                return UserInvestment.findAll({
                    where: { UserId: userId }
                })
            })
            .then((userInvest) => {
                // res.send(userInvest)
                res.render('investmentList', { invest, user, error, userInvest, formatRupiah })
            })
            .catch((err) => {
                console.log(err);
                res.send(err)
            })
    }
    static register(req, res) {
        let { errors } = req.query
        res.render('registerForm', { errors })
    }
    static registerPost(req, res) {
        const { name, email, password, role } = req.body
        User.create({ name, email, password, role })
            .then(() => {
                res.redirect('/login')
            })
            .catch((err) => {
                if (err.name = 'SequelizeValidationError') {
                    let errors = err.errors.map((el) => {
                        if (el.message == 'Invalid validator function: unique') {
                            return (`Email sudah terdaftar`)
                        } else {
                            return el.message
                        }
                    })
                    // console.log(errors)
                    res.redirect(`/register?errors=${errors}`)
                } else {
                    res.send(err)
                }

            })
    }
    static login(req, res) {
        const { error } = req.query
        res.render('login', { error })
    }
    static loginPost(req, res) {
        const { email, password } = req.body

        User.findOne({ where: { email } })
            .then((user) => {
                if (user) {
                    const isValidPassword = bcrypt.compareSync(password, user.password)
                    if (isValidPassword) {
                        req.session.userId = user.id
                        req.session.email = user.email
                        req.session.role = user.role
                        req.session.name = user.name
                        res.redirect(`/investments`)
                    } else {
                        let error = "Invalid password/email"
                        res.redirect(`/login?error=${error}`)
                    }
                } else {
                    let error = "Invalid password/email"
                    res.redirect(`/login?error=${error}`)
                }
            })
            .catch((err) => {
                console.log(err);
                res.send(err)
            })
    }
    static addWallet(req, res) {
        const id = req.session.userId
        Wallet.create()
            .then((newWallet) => {
                return Wallet.findByPk(newWallet.id)
            })
            .then((wallet) => {
                User.update({ WalletId: wallet.id }, {
                    where: { id }
                })
            })
            .then(() => {
                res.redirect(`/investments`)
            })
            .catch((err) => {
                res.send(err)
            })
    }
    static topUp(req, res) {
        const id = req.session.userId
        User.findByPk(id, {
            include: Wallet
        })
            .then((user) => {
                res.render(`topUp`, { user })
            })
    }
    static topUpPost(req, res) {
        const { money } = req.body
        const id = req.session.userId;
        User.findByPk(id, { include: Wallet })
            .then(user => Wallet.increment({ money }, {
                where: {
                    id: user.WalletId
                }
            }))
            .then(() => res.redirect("/investments"))
            .catch(err => res.send(err));

        // const { money, id } = req.body
        // Wallet.increment({ money: money }, { where: { id: id } })
        //     .then(() => {
        //         res.redirect(`/investments`)
        //     })
        //     .catch((err) => {
        //         res.send(err + `<<`)
        //     })
    }
    static buy(req, res) {
        const UserId = req.session.userId
        const { id } = req.params
        let user;
        let invest;
        let msg;
        console.log("ok");
        User.findByPk(UserId, {
            include: Wallet
        })
            .then((users) => {
                user = users
                console.log(user, "<<< user findByPk");
                return Investment.findByPk(id)
            })
            .then((investment) => {
                invest = investment
                console.log(user, "<<< user findByPk");
                console.log(invest, "<<< invest findByPk");
                if (user.Wallet.money < invest.investmentAmount) {
                    console.log(user.Wallet.money, "<<< uang user");
                    msg = "Uang Kurang"
                    res.redirect(`/investments?error=${msg}`)
                    return;
                } else {
                    Wallet.decrement({ money: invest.investmentAmount }, { where: { id: user.WalletId } })
                    UserInvestment.create({ UserId, InvestmentId: id, totalStock: 1 })
                    msg = "Pembelian berhasil"
                    res.redirect(`/investments?error=${msg}`)
                }
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    }

    static userInvest(req, res) {
        const { userId } = req.session;
        let investments;
        console.log(userId);
        UserInvestment.maxStock({
            where: {
                id: userId
            },
            col: "InvestmentId"
        })
            .then(stock => {

                return UserInvestment.findAll({
                    where: {
                        UserId: userId,
                    },
                    attributes: [
                        "UserId",
                        [sequelize.fn("count", sequelize.col("InvestmentId")), "totalStock"]
                    ],
                    include: {
                        model: Investment,
                        required: true,
                        include: {
                            model: Company,
                            required: true,
                        }
                    },
                    group: [
                        "UserId",
                        "Investment.id",
                        "Investment.investmentName",
                        "Investment.investmentAmount",
                        "Investment.investmentType",
                        "Investment.CompanyId",
                        "Investment.createdAt",
                        "Investment.updatedAt",
                        "Investment.Company.id",
                        "Investment.Company.companyName",
                        "Investment.Company.companyLogo",
                        "Investment.Company.email",
                        "Investment.Company.address",
                        "Investment.Company.description",
                        "Investment.Company.createdAt",
                        "Investment.Company.updatedAt"
                    ]
                })
            })
            .then(userInvestments => {
                investments = userInvestments;
                return User.findByPk(userId, {
                    include: [Wallet, UserInvestment]
                })
            })
            .then(user => {
                // res.send(user);
                res.render('userinvest', { user, investments, formatRupiah })
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });

    }

    static destroy(req, res) {
        const UserId = req.session.userId
        const { id } = req.params
        let user;
        let invest;
        let msg;
        User.findByPk(UserId, {
            include: Wallet
        })
            .then((users) => {
                user = users
                return Investment.findByPk(id)
            })
            .then((investment) => {
                invest = investment
                Wallet.increment({ money: invest.investmentAmount }, { where: { id: user.WalletId } })
                UserInvestment.destroy({
                    where: {
                        UserId: UserId,
                        InvestmentId: id
                    }
                });
                msg = "Penjualan Berhasil"
                res.redirect(`/investments?error=${msg}`)
            })
    }

    static add(req, res) {
        const UserId = req.session.userId
        const { id } = req.params
        let user;
        let invest;
        let msg;
        User.findByPk(UserId, {
            include: Wallet
        })
            .then((users) => {
                user = users
                return Investment.findByPk(id)
            }).then((investment) => {
                invest = investment
                console.log(UserInvestment, "<<<")
                Wallet.decrement({ money: invest.investmentAmount }, { where: { id: user.WalletId } })
                UserInvestment.increment("totalStock", {
                    where: {
                        UserId: UserId,
                        InvestmentId: id
                    }

                });
                msg = "Penjualan Berhasil"
                res.redirect(`/userInvestments?error=${msg}`)
            })
    }

    static sell(req, res) {
        const UserId = req.session.userId
        const { id } = req.params
        let user;
        let invest;
        let msg;
        User.findByPk(UserId, {
            include: Wallet
        })
            .then((users) => {
                user = users
                return Investment.findByPk(id)
            })
            .then((investment) => {
                invest = investment
                console.log(UserInvestment, "<<<")
                Wallet.increment({ money: invest.investmentAmount }, { where: { id: user.WalletId } })
                return UserInvestment.findOne({
                    where: {
                        [Op.and]: [{InvestmentId: invest.id}, {UserId}]
                    },
                    include: Investment
                })
            })
            .then(userInvest => {
                // console.log(userInvest);
                // res.send(userInvest)
                return UserInvestment.destroy({
                    where: {
                        id: userInvest.id
                    }
                })
            })
            .then(() => {
                msg = "Penjualan Berhasil"
                res.redirect(`/userInvestments?error=${msg}`)
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    }

    static companyDetail(req, res) {
        const { id } = req.params
        Company.findByPk(id, {
            include: Investment
        })
            .then((company) => {
                res.render('detailCompany', { company, formatRupiah })
            })
            .catch((err) => {
                res.send(err)
            })
    }
    static delete(req, res) {
        const { id } = req.params
        let msg;
        Investment.destroy({
            where: { id }
        })
            .then(() => {
                msg = `Success Delete Investment`
                res.redirect(`/investments?error=${msg}`)
            })
    }
    static addInvestment(req, res) {
        let { errors } = req.query
        Company.findAll()
            .then((company) => {
                res.render('addInvestment', { company, errors })
            })
            .catch((err) => {
                req.send(err)
            })

    }

    static addInvestmentPost(req, res) {
        const { investmentName, investmentAmount, investmentType, CompanyId } = req.body
        // console.log({investmentName,investmentAmount,investmentType,CompanyId})
        Investment.create({ investmentName, investmentAmount, investmentType, CompanyId })
            .then(() => {
                res.redirect('/investments')
            })
            .catch((err) => {
                if (err.name = 'SequelizeValidationError') {
                    let errors = err.errors.map((el) => {
                        return el.message
                    })
                    // console.log(errors)
                    res.redirect(`/addInvestment?errors=${errors}`)
                } else {
                    res.send(err)
                }

            })
    }


    static editInvestmentget(req, res) {
        let { errors } = req.query
        const { id } = req.params
        let msg;
        let investData
        let companydata
        Company.findAll({
            include: [Investment]
        })
            .then((result) => {
                companydata = result
                return Investment.findOne({ where: { id } })
            })
            .then((invest) => {
                res.render("editInvestment", { companydata, invest, errors })
            })
            .catch((err) => {
                req.send(err)
            })
    }

    static editInvestmentPost(req, res) {
        const { id } = req.params

        const { investmentName, investmentAmount, investmentType, CompanyId } = req.body
        console.log({ investmentName, investmentAmount, investmentType, CompanyId })
        Investment.update({ investmentName, investmentAmount, investmentType, CompanyId }, {
            where: {
                id: id
            }
        })
            .then(() => {
                res.redirect('/investments')
            })
            .catch((err) => {
                // console.log(err)
                if (err.name = 'SequelizeValidationError') {
                    let errors = err.errors.map((el) => {
                        return el.message
                    })
                    // console.log(errors)
                    res.redirect(`/${id}/editInvestment?errors=${errors}`)
                } else {
                    res.send(err)
                }

            })
    }

    static logOut(req, res) {
        req.session.destroy((err) => {
            if (err) {
                res.send(err)
            } else {
                res.redirect('/login')
            }
        })
    }
}
module.exports = Controller