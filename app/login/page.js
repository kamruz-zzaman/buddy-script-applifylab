"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <Image
          src="/assets/images/shape1.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_shape_img"
          style={{ width: "100%", height: "auto" }}
        />
        <Image
          src="/assets/images/dark_shape.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_dark_shape"
        />
      </div>
      <div className="_shape_two">
        <Image
          src="/assets/images/shape2.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_shape_img"
          style={{ width: "100%", height: "auto" }}
        />
        <Image
          src="/assets/images/dark_shape1.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <Image
          src="/assets/images/shape3.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_shape_img"
          style={{ width: "100%", height: "auto" }}
        />
        <Image
          src="/assets/images/dark_shape2.svg"
          alt=""
          width={300}
          height={300}
          unoptimized
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <Image
                    src="/assets/images/login.png"
                    alt="Image"
                    width={633}
                    height={500}
                    className="_left_img"
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="Image"
                    width={170}
                    height={40}
                    unoptimized
                    className="_left_logo"
                    style={{ height: "auto" }}
                  />
                </div>
                <p className="_social_login_content_para _mar_b8">
                  Welcome back
                </p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>
                <button
                  type="button"
                  className="_social_login_content_btn _mar_b40"
                >
                  <Image
                    src="/assets/images/google.svg"
                    alt="Image"
                    width={20}
                    height={20}
                    unoptimized
                    className="_google_img"
                    style={{ height: "auto" }}
                  />{" "}
                  <span>Or sign-in with google</span>
                </button>
                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <form className="_social_login_form" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control _social_login_input"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control _social_login_input"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="d-flex justify-content-center">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60 w-100">
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          disabled={loading}
                          style={{ minWidth: "100%" }}
                        >
                          {loading ? "Logging in..." : "Login now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Dont have an account?{" "}
                        <Link href="/registration">Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
