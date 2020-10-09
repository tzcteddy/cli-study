console.log('hello')
const program = require('commander');
const {version} = require('./constants');
const path=require('path');
const { action } = require('commander');

//指令集合 teddy create
const mapAction = {
    create:{//创建模板
        alias:'c',//配置命令的别称
        description:'create a project',//命令相关描述
        examples:[
            'teddy create <project-name>'
        ]
    },
    config:{//配置文件
        alias:'conf',
        description:'config project variable',
        examples:[
            'teddy config set <k> <v>',
            'teddy config get <k>'
        ]
    },
    '*':{//根据情况配置所需命令
        alias:'',
        description:'command not found',
        examples:[]
    }
}

//循环遍历创建的命令
Reflect.ownKeys(mapAction).forEach(action=>{
    program.command(action)//配置命令的名字
        .alias(mapAction[action].alias)
        .description(mapAction[action].description)
        .action(()=>{
            if(action === '*'){
                console.log(mapAction[action].description)
            }else{
                console.log(action);
                require(path.resolve(__dirname,action))(...process.argv.slice(3))
            }
        })
})

//运行 teddy --help
program.on('--help',()=>{
    console.log('\r\nExamples');
    Reflect.ownKeys(mapAction).forEach((action)=>{
        mapAction[action].examples.forEach(example=>{
            console.log(' '+example)
        })
    })
})

program.version(version).parse(process.argv);