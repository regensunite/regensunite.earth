import React from "react";
import useSWR from "swr";
import { formatUnits } from "@ethersproject/units";

const api_endpoint = (chain, address, token) => {
  return `/api/web3/etherscan?token=${token}&address=${address}&chain=${chain}`;
};

function BalanceWidget({ chain, address, token }) {
  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(api_endpoint(chain, address, token), fetcher);
  console.log(">>> api call", api_endpoint(chain, address, token));

  if (error) return "An error has occurred.";
  if (!data) return "Loading...";

  console.log(">>> data received", data);

  if (isNaN(parseFloat(data.balance))) return "Invalid response";

  return (
    <div>
      <strong>
        {parseFloat(
          parseFloat(formatUnits(data.balance, 18)).toFixed(2)
        ).toLocaleString()}
      </strong>{" "}
      {token}
    </div>
  );
}

export default BalanceWidget;
