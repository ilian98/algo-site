vector <int> a[MAXN];
int n,comp[MAXN];
int main () {
    string formula;
    cin >> formula ;
    make_implication_graph(formula,n,a); /// Приемаме, че тази функция прави от формулата formula графа на импликациите, като в n се записва броят променливи
    find_scc(2*n,a,comp); /// Приемаме, че тази функция намира компонентите и в масива comp за всеки връх сме запазили номера на компонентата му

    for (int i=0; i<n; i++) {
        /// За улеснение обикновено считаме, че връх с номер 2*i отговора за променлива i, а връх с номер 2*i+1 за отрицанието ѝ
        if (comp[2*i]==comp[2*i+1]) {
            cout << "No solution!";
            break;
        }
    }
    cout << endl ;
    return 0;
}
