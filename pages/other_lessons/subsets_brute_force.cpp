int n,i,mask,ans=0;
vector <int> subset;
cin >> n ;
for (mask=0; mask<(1<<n); mask++) {
    subset.clear();
    for (i=0; i<n; i++) {
        if (mask&(1<<i)) subset.push_back(i);
    }
    if (check_subset(subset)==true) ans++;
}