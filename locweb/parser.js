exports.par_i = function(string) {
	let i = 0
	let p_mas=[''];
	for (let ch of string) {
		if (ch=='_') {
			if (p_mas[i]=='') {return null;}
			p_mas.push('');
			i++;
		}else{
			if (isFinite(p_mas[i])) {p_mas[i]+=ch;} else {return null;}
		}
	}
	if (p_mas[i]=='') {return null;}
	else {return p_mas;}
}