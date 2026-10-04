const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

// Find rebuildQuizBank function - this shows how custom questions are merged
const rbPos = html.indexOf('function rebuildQuizBank');
console.log('rebuildQuizBank at:', rbPos);
console.log(html.substring(rbPos, rbPos + 600));

// Find how adminQs / customQ count is computed in admin panel
const adminSummary = html.indexOf('adminQuizBankSummaryCount');
console.log('\nadminQuizBankSummaryCount context:');
console.log(html.substring(Math.max(0,adminSummary-500), adminSummary+300));

// Find where MCQ bank data is loaded 
const mcqBankLoad = html.indexOf('bhu:mcqbank');
const mcqBankLoad2 = html.indexOf('MCQ_BANK');
const mcqBankLoad3 = html.indexOf('mcqBank');
console.log('\nbhu:mcqbank at:', mcqBankLoad);
console.log('MCQ_BANK at:', mcqBankLoad2);
console.log('mcqBank at:', mcqBankLoad3);
if (mcqBankLoad3 > -1) console.log(html.substring(Math.max(0,mcqBankLoad3-50), mcqBankLoad3+200));
