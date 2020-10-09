//下载模板 选择模板使用
//用过配置文件 获取模板信息(有哪些模板)
import { repoList, tagList, downloadLocal,} from './utils/git';
import ora from 'ora';//进度条
import inquirer from 'inquirer';//命令交互

let install = async () => {
    let loading = ora('fetching template ......');
    loading.start()
    let list = await repoList();
    loading.succeed();
    list = list.map(({name}) => name);
    //console.log(list);
    let answer = await inquirer.prompt([{
        type: 'list',
        name: 'project',
        choices: list,
        questions: 'pleace choice template'
    }]);
    // console.log(answer.project);
    //拿到当前项目
    let project = answer.project;
    //获取当前的项目的版本号
    loading = origin('fetching tag ......');
    loading.start();
    list = await tagList(project);
    loading.succeed();
    list = list.map(({name}) => name);
    let tag=answer.tag;
    //下载文件(先下载到缓存区文件中)
    //zf-cli init
    //下载中...
    loading=ora('download project ......');
    loading.start();
    //console.log(project,tag);
    await downloadLocal(project,tag);
    loading.succeed();
}

export default install;