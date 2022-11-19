let vue = new Vue({
   el:'#register',
   delimiters: ['${','}'],
   data:{
       // v-model
        username:'',
        password:'',
        smscode:'',
        imgcode:'',
        phone:'',

        // v-show
        error_username:false,
        error_password:false,
        error_phone:false,
        error_smscode:false,
        error_imgcode:false,

        // v-message
        error_username_msg:'请输入长度5-8的字符！',
        error_password_msg:'请输入长度3-8的字符！',
        error_phone_msg:'手机号输入有误！',
        error_smscode_msg:'验证码输入有误！',
        error_imgcode_msg:'验证码错误！',


       //图片验证码相关变量
       imgcode_url:'',
       uuid:'',

       //短信验证码相关变量
       smscode_btn:'获取短信验证码',
       send_flag:false,

   },mounted(){
       this.generate_imgcode();
    },
    methods:{
       send_smscode:function(){
           console.log('开始发送短信');
           //获取短信验证码功能

           // 1. 判断当前发送短信验证码状态
           if(this.send_flag){
               console.log('判断当前发送短信状态');
               return;
           }
           this.send_flag = true;

           // 2. 手机号和图片验证码校验
           this.check_phone();
           this.check_imgcode();

           if(this.error_phone || this.error_imgcode){
               this.send_flag = false;
               return;
           }
           console.log('手机号和图片验证码已经校验完毕！');
           console.log('开始向后端发起发送验证码请求');
           // 3. 发送短信验证码
           var url = '/smscodes/'+this.phone+'/?imgcode='+this.imgcode+'&uuid='+this.uuid;

           axios.get(url,{
               responseType:'json'
           }).then(response=>{
               // let code = response.data.code;
               // console.log(code)
               console.log(response);
               console.log(response.data);
               if(response.data.code == '200'){ //短信验证码正常发送
                   console.log('开始倒计时···········');
                   let num = 60;
                   let id = setInterval(()=>{
                       if(num == 1){
                           clearInterval(id);
                           this.send_flag = false;
                           this.smscode_btn = '获取短信验证码';
                       }else{
                           num -= 1;
                           this.smscode_btn = '倒计时：'+num + '秒';
                           // console.log('倒计时：%d', num);
                           // if(!this.error_smscode){
                           //     num = 1;
                           //     console.log("倒计时结束·")
                           // }

                       }
                   },1000,60);

                console.log('验证码发送成功');
               }else{//短信验证码发送错误
                   console.log('验证码发送失败')
                   if(response.data.code == '4001'|| response.data.code == '4002' || response.data.code == '4003' ||response.data.code == '5001' || response.data.code=='4004'){
                       this.error_smscode = true;
                       this.error_smscode_msg = response.data.errormsg;

                   }

                   this.send_flag = false;
                   this.generate_imgcode();
               }
           }).catch(error=>{
               console.log(error.response);
           })
       },
       check_smscode:function(){
           console.log('失去焦点，开始检查短信验证码');
           // 1. 短信验证码格式校验
           let reg = /^\d{6}$/;
           if(!reg.test(this.smscode)){
               // console.log(this.smscode);
               this.error_smscode = true;
           }else{
               this.error_smscode = false;
               console.log('短信验证码格式校验成功')
           }
           // 2.短信验证码有效性校验
           if(!this.error_smscode){
               console.log('开始校验短信验证码有效性');
               axios.get('/check_smscode/'+this.phone+'/?smscode='+this.smscode,{
                   responseType:'json'
               }).then(response=>{
                   let code = response.data.code_num;
                   console.log(code);
                   if(code != '200'){
                       console.log('状态码非200---');
                       this.error_smscode_msg = response.data.errormsg;
                       this.error_smscode = true;
                   }else{
                       this.error_smscode = false;
                       console.log('短信验证码检验成功！')
                   }
               })

           }

       },
       check_imgcode:function(){
           console.log('开始检验图片验证码');

           //非空校验（用户输入的图片验证码值不能为空）
           if(!this.imgcode){
               this.error_imgcode_msg = '图片验证码不能为空！';
               this.error_imgcode = true;
           }else{
               this.error_imgcode = false;
           }
           console.log('图片验证码非空校验成功')

       },
       // 图片验证码展示功能
       generate_imgcode:function(){
           console.log('开始生成图片验证码.....');
           // 生成uuid
           this.uuid = generateUUID();
           // 生成请求地址
           this.imgcode_url = '/imgcodes/'+this.uuid+'/';
           console.log('图片验证码已生成')
       },
       // 校验用户名(只能输入5-8位字符)
        check_uname:function(){
           console.log('开始校验用户名');
            //1.格式校验
            let reg = /^[A-Za-z][A-Za-z0-9_]{4,7}$/;
            if(!reg.test(this.username)){
                this.error_username = true;
            }else{
                this.error_username = false;
                console.log('用户名格式正确')
            }

            //2.用户名是否重复注册校验
            if(!this.error_username){
                console.log('校验用户名是否重复');
                axios.get('/usernames/'+this.username+'/count/',{
                    responseType:'json'
                }).then(response=>{
                    if(response.data.count==1){
                        this.error_username_msg = '当前用户名已经注册';
                        this.error_username = true;
                    }else{
                        this.error_username = false;
                        console.log('校验用户名重复性成功')
                    }
                }).catch(error=>{
                    console.log(error.response);
                });
            }
        },
        // 校验密码
        check_pwd:function(){
           console.log('开始校验密码');
            let reg = /^[A-Za-z0-9_]{3,8}$/;
            if(!reg.test(this.password)){
                this.error_password = true;
            }else{
                this.error_password = false;
                console.log('密码格式校验通过')
            }
        },
        // 校验手机号
        check_phone:function(){
           console.log('开始校验手机号....');
           console.log('校验手机号格式');
            // 1.格式校验
            let reg = /^1[3,5,7,8,9]\d{9}$/;
            if(!reg.test(this.phone)){
                this.error_phone = true;
            }else{
                this.error_phone = false;
            }
            console.log('校验手机号格式成功');

            // 2.手机号是否重复注册校验
            if(!this.error_phone){
                console.log('校验手机号是否重复');
                axios.get('/phones/'+this.phone+'/count/',{
                    responseType:'json'
                }).then(response=>{
                    if(response.data.count===1){
                        this.error_phone_msg = '手机号已经被注册';
                        this.error_phone = true;
                    }else{
                        this.error_phone = false;
                    }
                }).catch(error=>{
                    console.log(error.response);
                });
            }
            console.log('校验手机号重复性成功')
        },
        // 监听表单提交事件
        reg_sub:function(){
           console.log('开始提交表单.....');
            this.check_uname();
            this.check_phone();
            this.check_pwd();
            // this.check_smscode();
            // this.check_imgcode();

            if(this.error_username||this.error_phone||this.error_password||this.error_imgcode||this.error_smscode){
                //阻止表单提交
                window.event.returnValue = false;
            }
            console.log('表单提交成功！')
        }

    }
});
