const currency = (n: number, currency = "INR") =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(n || 0);

export default currency


