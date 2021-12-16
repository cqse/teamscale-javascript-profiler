function bla() {}

function foo() {
  var t = true;
  var a = 12,
    b = t || bla().goo();
  if (false) {
    return 2;
  }
  (0, eval)("var x = 1 + 2;\n//# sourceMappingUrl=src.js.map");
  var c = a && (b || c) && bla();
  document.getElementById("result").innerText = "test successful!";
  return 1;
}

foo();
