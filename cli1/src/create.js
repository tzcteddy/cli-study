const axios = require('axios');
const ora = require('ora');//loading样式
const inquirer=require('inquirer');//选择模板
let {promisify} = require('util');
let path = require('path');
let fs = require('fs');
let downloadGit = require('download-git-repo');//拉取模板
downloadGit=promisify(downloadGit);

let {downLoadDirectory}=require('./constans');
let MetalSmith=require('metalsmith');//遍历文件夹，找需不需要渲染

//consolidate统一模板引擎
let {render} = require('consolidate').ejs;
render=promisify(render);
let ncp=require('ncp');
ncp=promisify(ncp);

//项目列表
const fetchRepoList=async ()=>{
    let {data}=await axios.get('https://api.github.com/tzcteddy/cli-study');
    return data
}

//loading
const waitFnloading=(fn,message)=> async ()=>{
    let spinner = ora(message);
    spinner.start();
    let result=await fn(...args);
    spinner.succeed();
    return result
}

//tag列表
const fetchTagList=async (repo)=>{
    let {data} = await axios.get(`https://api.github.com/tzcteddy/cli-study/${repo}/tags`);
    return data
}

let download=async (repo,tag)=>{
    let api=`teddy/${repo}`;
    if(tag){
        api+=`#${tag}`;
    }
    let dest = `${downLoadDirectory}/${repo}`;
    await downloadGit(api,dest);
    return dest; //显示下载的最终目录
}
module.exports=async (projectName)=>{//projectName是src/mian.js文件第42行的传进参数
    let repos=await waitFnloading(fetchRepoList,'fetch template ...')();
    repos=repos.map(item=>item.name);

    //在获取之前 显示loading 关闭loading
    //选择模板 inquirer
    let {repo}=await inquirer.prompt({//在命令行中询问客户问题
        name:'repo',//获取选择后的结果
        type:'list',
        message:'please choise a template to create project',
        choices:repos
    })

    let tags=await waitFnloading(fetchTagList,'fetch tags ...')(repo);
    tags=tags.map(item=>item.name);
    let {tag}=await inquirer.prompt({
        name:'tag',
        type:'list',
        message:'please choise tags to create project',
        choices:tags
    })
    // console.log(repo,tag);//下载模板 版本
    //把模板放到一个临时目录里存好，以备后期使用
    let result = await waitFnloading(download,'download template')(repo,tag);
    //console.log(result);//下载的目录

    //拿到下载的目录 直接拷贝当前执行的目录下即可 ncp

    if(!fs.existsSync(path.join(result,'ask.js'))){
        await ncp(result,path.resolve(projectName));
    }else{
        await new Promise((resolve,reject)=>{
            MetalSmith(__dirname)
                .source(result)
                .destination(path.resolve(projectName))
                .use(async (files,metal,done)=>{
                    let args=require(path.join(result,'ask.js'));
                    let obj=await inquirer.prompt(args);

                    let meta=metal.metadata();
                    Object.assign(meta,obj);
                    delete files['ask.js'];
                    done();
                })
                .use((files,metal,done)=>{
                    let obj=metal.metadata();
                    Reflect.ownKeys(files).forEach(async file=>{
                        if(file.includes('js')||file.includes('json')){
                            let content=files[file].content.toString();//文件的内容
                            if(content.includes('<%')){
                                conteny=await render(content,obj);
                                files[file].contents=Buffer.from(content);//渲染结果
                            }
                        }
                    })
                    done();
                })
                .build((err)=>{
                    if(err){
                        reject();
                    }else{
                        resolve();
                    }
                })
        })
    }
}

