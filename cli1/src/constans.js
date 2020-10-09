const { version}=require('../package.json');

//存储模板的位置 下载前先找临时目录存放下载的文件
const downLoadDirectory=`${process.env[process.platform === 'darwin'?'HOME':'USERPROFILE']}\\.template`;
module.exports={
    version,
    downLoadDirectory
}