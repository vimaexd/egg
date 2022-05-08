class Utils {
    /**
     * Delay by amount of milliseconds asynchronously
     * @param ms Number of milliseconds to delay
     * @returns Promise
     */
    delay = (ms: number) => {
        return new Promise(res => setTimeout(res, ms));
    }

    /**
     * Random number generator
     * @param min Minimum number
     * @param max Maximum number
     * @returns Number
     */
    rng = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    /**
     * Check if a String is a number
     * @param str String to check
     * @returns boolean
     */
    isNumeric = (str: string | number) =>  {
        if (typeof str != "string") return false;
        return !isNaN(parseInt(str)) && !isNaN(parseFloat(str))
    }

    isFloat = (str: string) => {
      var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
      if (!floatRegex.test(str))
          return false;
  
      let fl = parseFloat(str);
      if (isNaN(fl))
          return false;
      return true;
    }

    nFormatter(num: number, digits: number) {
      const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
      ];
      const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
      });
      return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }
}

export default Utils;