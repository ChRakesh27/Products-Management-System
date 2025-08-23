const currency = (n: number) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "INR",
    }).format(n || 0);

export default currency