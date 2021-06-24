int sum_query (int ind, int l, int r, int ql, int qr) {
    if ((ql<=l)&&(r<=qr)) { // стигнахме връх, който отговаря за интервал, съдържащ се в заявката
        return tree[ind];
    }
    int mid=(l+r)/2,sum=0;
    if (ql<=mid) sum+=sum_query(2*ind,l,mid,ql,qr);
    if (qr>=mid+1) sum+=sum_query(2*ind+1,mid+1,r,ql,qr);
    return sum;
}