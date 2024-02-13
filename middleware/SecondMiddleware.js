let SecondMiddleware=(req, res, next)=>{
    
    if(! req.session.isLogin){
        res.redirect("/");
    }
    else{
        next();
    }    
}
exports.SecondMiddleware=SecondMiddleware;