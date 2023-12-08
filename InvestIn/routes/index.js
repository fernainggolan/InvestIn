const Controller = require("../controllers/controllers")

const router = require("express").Router()

router.get('/investments',Controller.investmentList)

router.get('/addWallet',Controller.addWallet)

router.get('/topUp',Controller.topUp)

router.post('/topUp',Controller.topUpPost)

router.get('/userInvestments',Controller.userInvest)

router.get('/addInvestment',Controller.addInvestment)

router.post('/addInvestment',Controller.addInvestmentPost)

router.get('/logout',Controller.logOut)

router.get('/:id/buy',Controller.buy)

router.get('/:id/destroy',Controller.destroy)

router.get('/:id/sell',Controller.sell)

router.get('/:id/add',Controller.add)

router.get('/:id/companyDetail',Controller.companyDetail)

router.get('/:id/Delete',Controller.delete)

router.get('/:id/editInvestment',Controller.editInvestmentget)

router.post('/:id/editInvestment',Controller.editInvestmentPost)

module.exports = router