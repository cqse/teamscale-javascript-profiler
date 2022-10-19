import {instrumentWithSwc, loadInputSourceMap} from '../../src/instrumenter/Instrumenter';
import { Optional } from 'typescript-optional';

test('Remove Function Coverage Increments', () => {
	const code = `
	function foo() {
		var a = 9;
		a = a + 1;
		console.log(a);
	}
		
	function bar() {
		saySomething();
		var i = 1;
		i++;
		foo();
	}
	`;

	const instrumented = instrumentWithSwc('test.js', code, undefined);
	console.log(instrumented);
});

test('Instrumenting File With Source Map Present', () => {
	const code = `
console.log("Hello Number One!"),console.log("Hello Number Two!"),console.log("Hello Number Three!");export function foo(){return 1}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gTnVtYmVyIE9uZSEnKTtcbmNvbnNvbGUubG9nKCdIZWxsbyBOdW1iZXIgVHdvIScpO1xuY29uc29sZS5sb2coJ0hlbGxvIE51bWJlciBUaHJlZSEnKTtcbmV4cG9ydCBmdW5jdGlvbiBmb28oKSB7XG4gICAgdmFyIGEgPSAxO1xuICAgIHZhciBiID0gMTtcbiAgICBpZiAoYSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG59Il0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciLCJmb28iXSwibWFwcGluZ3MiOiJBQUFBQSxRQUFRQyxHQUFHLENBQUMscUJBQ1pELFFBQVFDLEdBQUcsQ0FBQyxxQkFDWkQsUUFBUUMsR0FBRyxDQUFDLHNCQUNaLFFBQU8sU0FBU0MsS0FBTSxRQUlQLENBSWYsQ0FBQyJ9
	`;

	const sourceMap = loadInputSourceMap(code, 'test.js', Optional.empty());
	const instrumented = instrumentWithSwc('test.js', code, sourceMap);
	console.log(instrumented);
})