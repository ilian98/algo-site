int n,i,ans=0;
cin >> n ;
vector <int> v;
v.reserve(n);
for (i=1; i<=n; i++) {
    v.push_back(i);
}
do {
    if (check_permutation(v)==true) ans++;
} while (next_permutation(v.begin(),v.end()));