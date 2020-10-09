const HOME=process.env[process.platform==='win32'?'USERPROFILE':'HOME'];

export const RC=`${HOME}/.teddy`;
export const DEFAULTS={
    registry:'teddy',
    type:'orgs'
}