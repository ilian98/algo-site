for (int i=0; i<n; i++) {
    /// За улеснение обикновено считаме, че връх с номер 2*i отговора за променлива i, а връх с номер 2*i+1 за отрицанието ѝ
    if (comp[2*i]>comp[2*i+1]) cout << "True ";
    else cout << "False ";
}
