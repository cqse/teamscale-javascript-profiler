use std::{sync::Mutex, collections::HashMap};

use swc_core::{
    ecma::ast::{Decl, Expr, Stmt},
    ecma::visit::{VisitMut},
};

use lazy_static::lazy_static;
use swc_ecma_quote::swc_ecma_ast::{VarDeclarator, Pat, Lit, FnDecl};

lazy_static! {
    pub static ref COV_FN_NAME_TO_HASH: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
    pub static ref COV_FN_NAME_TO_NUMBER: Mutex<HashMap<String, i32>> = Mutex::new(HashMap::new());
}

#[derive(Debug)]
pub struct FileIdVisitor { }

fn extract_file_hash(n: &VarDeclarator) -> Option<String> {
    match &n.name {
        Pat::Assign(assign) => {
            match &assign.left.as_ref() {
                Pat::Ident(ident) => {
                    if !ident.sym.to_string().eq_ignore_ascii_case("hash") {
                        return Option::None;
                    }
                }
                _ => {}
            }

            match &assign.right.as_ref() {
                Expr::Lit(literal) => match &literal {
                    Lit::Str(string_literal) => {
                        return Option::Some(string_literal.value.to_string());
                    }
                    _ => {}
                },
                _ => {}
            }
        }
        _ => {}
    }

    Option::None
}

#[derive(Debug)]
pub struct CovFunctionSummary {
    cov_fn_name: String,
    cov_fn_id: String,
    file_hash: String,
}

fn extract_cov_fn_summary(fn_decl: &FnDecl) -> Option<CovFunctionSummary> {
    // function cov_oqh6rsgrd() {
    let cov_fn_name = fn_decl.ident.sym.to_string();
    if !cov_fn_name.starts_with("cov_") {
        return Option::None;
    }
    let cov_fn_id = &cov_fn_name[5..];

    return match &fn_decl.function.body {
        Some(block_stmt) => {
            if block_stmt.stmts.len() > 1 {
                let hash_assign_stmt = &block_stmt.stmts[1];
                match hash_assign_stmt {
                    Stmt::Decl(decl_stmt) => match decl_stmt {
                        Decl::Var(var_decl) => {
                            if var_decl.decls.len() != 1 {
                                return None;
                            }

                            let hash_decl = &var_decl.decls[0];

                            match extract_file_hash(hash_decl) {
                                Some(hash) => {
                                    return Some(CovFunctionSummary {
                                        cov_fn_id: String::from(cov_fn_id),
                                        cov_fn_name: cov_fn_name,
                                        file_hash: hash,
                                    });
                                }
                                None => return None,
                            }
                        }
                        _ => return None,
                    },
                    _ => return None,
                }
            }
            None
        }
        _ => return None,
    };
}

impl VisitMut for FileIdVisitor {
    fn visit_mut_decl(&mut self, n: &mut Decl) {
        match n {
            Decl::Fn(fn_decl) => match extract_cov_fn_summary(fn_decl) {
                Some(summary) => {
                    let mut map = COV_FN_NAME_TO_HASH.lock().unwrap();
                    let key = summary.cov_fn_name.clone();
                    map.insert(key, summary.file_hash);
                }
                None => {}
            },
            _ => {}
        }
    }
}
