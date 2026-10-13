// Selection enhancement only; every operation and amount is validated by the server.
const lineBoxes = [...document.querySelectorAll('[data-line-select]')]
function updateSelection() {
  const checked=lineBoxes.filter(box=>box.checked)
  const amount=checked.reduce((sum,box)=>sum+Number(box.dataset.total),0).toLocaleString('en-US')+'원'
  document.querySelectorAll('[data-selected-count]').forEach(node=>node.textContent=checked.length)
  document.querySelectorAll('[data-selected-total]').forEach(node=>node.textContent=amount)
  document.querySelectorAll('[data-select-all]').forEach(box=>{box.checked=checked.length===lineBoxes.length;box.indeterminate=checked.length>0&&checked.length<lineBoxes.length})
  document.querySelectorAll('[data-group-toggle]').forEach(box=>{const group=lineBoxes.filter(line=>line.dataset.group===box.dataset.groupToggle);box.checked=group.every(line=>line.checked);box.indeterminate=group.some(line=>line.checked)&&!box.checked})
}
document.querySelectorAll('[data-select-all]').forEach(box=>box.addEventListener('change',()=>{lineBoxes.forEach(line=>line.checked=box.checked);updateSelection()}))
document.querySelectorAll('[data-group-toggle]').forEach(box=>box.addEventListener('change',()=>{lineBoxes.filter(line=>line.dataset.group===box.dataset.groupToggle).forEach(line=>line.checked=box.checked);updateSelection()}))
lineBoxes.forEach(box=>box.addEventListener('change',updateSelection))
updateSelection()

document.querySelectorAll('[data-js-control]').forEach(node=>node.hidden=false)
document.querySelectorAll('.no-js-group').forEach(node=>node.hidden=true)
const passwordToggle=document.querySelector('.password-toggle')
if(passwordToggle){passwordToggle.hidden=false;passwordToggle.addEventListener('click',()=>{const input=document.getElementById('password');const show=input.type==='password';input.type=show?'text':'password';passwordToggle.textContent=show?'비밀번호 숨기기':'비밀번호 표시';passwordToggle.setAttribute('aria-pressed',String(show))})}
