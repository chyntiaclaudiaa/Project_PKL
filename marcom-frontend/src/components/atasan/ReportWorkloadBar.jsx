export default function ReportWorkloadBar({
  data,
  grandTotal,
}) {

  return (

    <div className="space-y-6 ">

      {data.map((user) => {

        const total =
          Number(user.total);

        const percent =
          grandTotal > 0
            ? (
                total /
                grandTotal *
                100
              ).toFixed(1)
            : 0;

        return (

          <div key={user.id}>

            <div className="flex justify-between mb-2">

              <div>

                <p className="font-medium text-slate-700">
                  {user.name}
                </p>

                <p className="text-xs text-slate-400">
                  {percent}% dari seluruh request
                </p>

              </div>

              <span
                className="
                  font-semibold
                  text-slate-700
                "
              >
                {total}
              </span>

            </div>

            <div
              className="
                flex
                h-5
                rounded-full
                overflow-hidden
                bg-slate-100
              "
            >

              {Number(user.menunggu) > 0 && (
                <div
                  className="bg-orange-600"
                  style={{
                    width:
                      `${Number(user.menunggu)
                        / grandTotal * 100}%`,
                  }}
                />
              )}

              {Number(user.diproses) > 0 && (
                <div
                  className="bg-blue-600"
                  style={{
                    width:
                      `${Number(user.diproses)
                        / grandTotal * 100}%`,
                  }}
                />
              )}

              {Number(user.revisi) > 0 && (
                <div
                  className="bg-orange-700"
                  style={{
                    width:
                      `${Number(user.revisi)
                        / grandTotal * 100}%`,
                  }}
                />
              )}

              {Number(user.selesai) > 0 && (
                <div
                  className="bg-green-600"
                  style={{
                    width:
                      `${Number(user.selesai)
                        / grandTotal * 100}%`,
                  }}
                />
              )}

              {Number(user.ditolak) > 0 && (
                <div
                  className="bg-red-600"
                  style={{
                    width:
                      `${Number(user.ditolak)
                        / grandTotal * 100}%`,
                  }}
                />
              )}

            </div>

          </div>

        );

      })}

    </div>

  );
}