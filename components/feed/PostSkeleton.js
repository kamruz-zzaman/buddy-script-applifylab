"use client";

function PostSkeleton() {
  return (
    <div
      className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
      style={{ animation: "pulse 1.5s infinite" }}
    >
      <div className="_padd_r24 _padd_l24">
        {/* Header skeleton */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#e4e6eb",
            }}
          />
          <div>
            <div
              style={{
                width: "120px",
                height: "14px",
                borderRadius: "6px",
                background: "#e4e6eb",
                marginBottom: "6px",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "12px",
                borderRadius: "6px",
                background: "#e4e6eb",
              }}
            />
          </div>
        </div>

        {/* Content skeleton */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              width: "100%",
              height: "14px",
              borderRadius: "6px",
              background: "#e4e6eb",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "80%",
              height: "14px",
              borderRadius: "6px",
              background: "#e4e6eb",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "60%",
              height: "14px",
              borderRadius: "6px",
              background: "#e4e6eb",
            }}
          />
        </div>

        {/* Image skeleton */}
        <div
          style={{
            width: "100%",
            height: "200px",
            borderRadius: "8px",
            background: "#e4e6eb",
            marginBottom: "16px",
          }}
        />
      </div>

      {/* Reactions bar skeleton */}
      <div
        className="_padd_r24 _padd_l24 _mar_b26"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#e4e6eb",
            }}
          />
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#e4e6eb",
            }}
          />
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#e4e6eb",
            }}
          />
        </div>
        <div
          style={{
            width: "80px",
            height: "12px",
            borderRadius: "6px",
            background: "#e4e6eb",
          }}
        />
      </div>

      {/* Action buttons skeleton */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #e4e6eb",
          paddingTop: "8px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "32px",
            borderRadius: "6px",
            background: "#e4e6eb",
            margin: "0 8px",
          }}
        />
        <div
          style={{
            flex: 1,
            height: "32px",
            borderRadius: "6px",
            background: "#e4e6eb",
            margin: "0 8px",
          }}
        />
        <div
          style={{
            flex: 1,
            height: "32px",
            borderRadius: "6px",
            background: "#e4e6eb",
            margin: "0 8px",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default PostSkeleton;
