import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 400 400">
        <rect width="400" height="400" rx="72" fill="#f3f0e8" />
        <path
          d="M 399 52 L 374 59 L 330 61 L 300 71 L 291 77 L 280 89 L 263 122 L 247 139 L 235 147 L 211 159 L 188 168 L 185 163 L 186 147 L 190 137 L 197 126 L 209 114 L 223 105 L 244 99 L 225 101 L 206 109 L 188 124 L 177 139 L 173 150 L 169 174 L 163 186 L 148 201 L 134 208 L 124 210 L 105 210 L 89 207 L 52 208 L 38 213 L 30 214 L 1 225 L 0 237 L 33 225 L 50 221 L 81 221 L 126 233 L 140 240 L 155 253 L 170 280 L 187 297 L 211 309 L 252 322 L 255 325 L 268 331 L 260 323 L 248 315 L 225 307 L 205 297 L 193 288 L 182 274 L 176 255 L 166 237 L 166 232 L 172 226 L 186 223 L 214 225 L 229 229 L 248 239 L 268 257 L 279 271 L 294 286 L 316 301 L 337 311 L 364 320 L 399 326 L 398 320 L 375 315 L 353 307 L 333 297 L 319 288 L 294 264 L 280 245 L 267 232 L 246 217 L 246 215 L 249 212 L 272 201 L 297 183 L 305 179 L 322 175 L 342 175 L 353 177 L 367 182 L 388 194 L 399 205 L 399 185 L 393 182 L 387 175 L 392 168 L 399 165 L 399 156 L 378 164 L 376 166 L 366 168 L 323 167 L 311 169 L 289 177 L 270 190 L 260 195 L 231 204 L 203 206 L 188 204 L 182 200 L 182 197 L 185 192 L 200 178 L 212 170 L 244 155 L 264 138 L 274 124 L 286 94 L 290 88 L 303 76 L 324 67 L 339 64 L 358 64 L 370 62 L 391 56 Z"
          fill="#11110f"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  );
}
